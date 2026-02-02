import SearchBar from "../../components/SearchBar";
import { useWhiteBackground } from "../../components/HtmlBackgroundManager";
import CenterLayout from "@alliance/sharedweb/ui/CenterLayout";

const SearchPage = () => {
  useWhiteBackground();

  return (
    <CenterLayout>
      <p className="font-serif text-3xl md:text-4xl font-semibold mb-4">
        Search
      </p>
      <div className="flex w-full">
        <SearchBar autofocus />
      </div>
    </CenterLayout>
  );
};

export default SearchPage;
