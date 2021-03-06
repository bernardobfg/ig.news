import { render, screen } from '@testing-library/react';
import { getPrismicClient } from "../../services/prismic";
import { mocked } from 'ts-jest/utils'
import Post, { getServerSideProps } from '../../pages/posts/[slug]'
import { getSession } from 'next-auth/client';

const post = {
  slug: "my-new-post",
  title: "My New Post",
  content: "<p>Post content</p>",
  updatedAt: "01 de abril de 2021",
}

jest.mock('../../services/prismic')
jest.mock('next-auth/client')
describe('Post Page', () => {
  it('renders correctly', () => {

    render(<Post post={post} />);
    expect(screen.getByText("My New Post")).toBeInTheDocument();
    expect(screen.getByText("Post content")).toBeInTheDocument();
  });
  it('redirect user if no subscription is found', async () => {

    const getSessionMocked = mocked(getSession)
    getSessionMocked.mockResolvedValueOnce(null)
  
    const response = await getServerSideProps(
      {
        params: { slug: 'my-new-post' }
      } as any)
    expect(response).toEqual(
      expect.objectContaining({
        redirect: expect.objectContaining({
          destination: '/posts/preview/my-new-post'
        })
      })
    )
  })
  it('load initial data', async () => {
          
    const getSessionMocked = mocked(getSession)
    const getPrismicClientMocked = mocked(getPrismicClient)
    
    getSessionMocked.mockResolvedValueOnce({
      activeSubscription: 'fake-active-subscription'
    } as any)

    getPrismicClientMocked.mockReturnValueOnce({
      getByUID: jest.fn().mockResolvedValueOnce({
        data: {
          title: [
            {type: 'heading', text: 'My New Post'}
          ],
          content: [
            { type: 'paragraph', text: 'Post content' }
          ],
        },
        last_publication_date: '04-01-2021'
      })
    } as any)

    const response = await getServerSideProps(
      {
        params: { slug: 'my-new-post' }
      } as any)
    expect(response).toEqual(
      expect.objectContaining({
        props: {
          post: {
            slug: 'my-new-post',
            title: 'My New Post',
            content: '<p>Post content</p>',
            updatedAt: '2021 M04 01',
          }
        }
      })
    )

  })
});