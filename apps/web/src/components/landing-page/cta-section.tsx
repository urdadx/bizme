import { Link } from "@tanstack/react-router";
import { Button } from "../ui/button";
import StarSVG from "@/assets/icons/star-svg";

export const CTASession = () => {
  return (
    <>
      <section>
        <div className="relative pt-16 md:pt-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-3xl  text-center sm:mx-auto lg:mr-auto lg:mt-0 lg:w-4/5">
              <h1 className="mt-8 text-balance text-4xl font-semibold md:text-5xl xl:text-6xl xl:leading-[1.3] instrument-serif-regular">
                Better audience engagement for your{" "}
                <span className="text-primary bg-primary/10 px-1 rounded relative inline-block z-1">
                  content
                </span>
              </h1>

              <p className="mx-auto mt-8 hidden max-w-xl text-wrap text-lg sm:block">
                Bizme helps you create engaged communities by artfully promoting
                your best content and carefully fueling the best conversations.
              </p>
              <p className="mx-auto mt-6 block max-w-xl text-wrap text-lg sm:hidden"></p>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md rounded-xl my-12 flex justify-center">
            <div className="flex flex-row gap-3 items-center justify-center w-full">
              <Link to="/register">
                <Button size="sm">Get started</Button>
              </Link>
              <a
                target="_blank"
                href="https://github.com/urdadx/bizme"
                rel="noreferrer"
              >
                <Button size="sm" variant="outline">
                  <StarSVG /> Star on Github
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
