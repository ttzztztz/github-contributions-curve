import { GetServerSideProps, GetStaticProps } from "next";
import { Home } from "../../../components/home";
import { IHomeProps } from "../../../models/home";

// export default async (req: NextApiRequest, res: NextApiResponse) => {
//   const username = "ttzztztz";
//   const timeWindow = "1";

//   const documentRes = await fetch(
//     "https://github-contributions-curve.ttzztztz.vercel.app/"
//   );
//   const { window } = new JSDOM(await documentRes.text(), {
//     runScripts: "dangerously",
//   });

//   res.write("not done yet!");
// };

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
    return {
      props: {
        preRender: true,
        initialUsername: username,
        initialTimeWindow: window,
      },
    };
  }

  return {
    props: {},
  };
};
