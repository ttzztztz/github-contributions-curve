import { GetServerSideProps, GetStaticProps } from "next";
import { Home } from "../../../components/home";
import { IHomeProps } from "../../../models/home";

export default Home;

export const getServerSideProps: GetServerSideProps<
  IHomeProps,
  {
    username: string;
    window: string;
  }
> = async (context) => {
  if (context.params) {
    const { username, window } = context.params;

    const resp = await fetch(`http://localhost:3000/api/${username}`);
    const initialData = await resp.json();

    return {
      props: {
        preRender: true,
        initialUsername: username,
        initialTimeWindow: window,
        initialData,
      },
    };
  }

  return {
    props: {},
  };
};
