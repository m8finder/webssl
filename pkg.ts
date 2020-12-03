interface Pkg {
  name: string;
  description: string;
  version: string;
}

export const getPkg = (): Pkg => {
  return {
    name: "webssl",
    description:
      "Simply create an OpenSSL certificate for your local web or mobile development that just work!",
    version: "3.4.0",
  };
};
