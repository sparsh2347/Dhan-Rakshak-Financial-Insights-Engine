import Searchbar from "@/components/Searchbar";

const page = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-[100vh] text-black">
      <div className="text-center flex flex-col gap-y-8 w-full">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
          Get insight about stocks
        </h1>
        <p className="text-lg md:text-xl text-gray-600">
          Know before you invest.
        </p>
        <Searchbar />;
      </div>
    </div>
  );
};

export default page;