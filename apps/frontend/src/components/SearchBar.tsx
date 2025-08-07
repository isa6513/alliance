import {
  searchAll,
  SearchItemDto,
  SearchItemType,
} from "@alliance/shared/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [items, setItems] = useState<SearchItemDto[]>([]);
  const categories: SearchItemType[] = ["user", "action", "post"];

  const categoryNames: Record<SearchItemType, string> = {
    user: "Users",
    action: "Actions",
    post: "Posts",
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const fetchItems = useCallback(async () => {
    const res = await searchAll({ query: { query: search } });
    if (res.data) {
      setItems(res.data);
    }
  }, [search]);

  const itemsByCategory = useMemo(() => {
    return items.reduce((acc, item) => {
      acc[item.type] = [...(acc[item.type] || []), item];
      return acc;
    }, {} as Record<SearchItemType, SearchItemDto[]>);
  }, [items]);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchItems();
    }, 50);
    return () => clearTimeout(id);
  }, [search, fetchItems]);

  const categoriesWithItems = categories.filter(
    (category) => itemsByCategory[category]?.length > 0
  );

  const handleItemClick = useCallback(
    (item: SearchItemDto) => {
      console.log(item);
      if (item.webAppLocation) {
        navigate(item.webAppLocation);
        setSearch("");
        setOpen(false);
      }
    },
    [navigate]
  );

  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.addEventListener("click", (event) => {
      if (divRef.current && !divRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    });
    return () => {
      window.removeEventListener("click", () => {});
    };
  }, []);

  console.log(items);

  return (
    <div
      ref={divRef}
      className="relative flex-1 max-w-[500px] flex flex-col overflow-visible h-[37.5px] rounded-md"
    >
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-zinc-100 p-2 px-3 rounded-md focus:outline-none"
        value={search}
        onChange={onChange}
        onFocus={() => setOpen(true)}
      />
      {open && items.length > 0 && (
        <div className="w-full bg-zinc-100 -mt-[3px] pt-[7px] shrink-0 rounded-b-md p-2 flex flex-col max-h-[calc(100vh-50px)] overflow-y-auto">
          {categoriesWithItems.map((category) => (
            <div key={category} className=" w-full">
              <p className="text-black text-sm font-medium pl-3 pt-3 w-full border-t border-zinc-200">
                {categoryNames[category]}
              </p>
              {itemsByCategory[category]?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className="text-black hover:bg-zinc-200 p-3 rounded-md flex flex-row justify-start cursor-pointer items-center"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="aspect-square h-8 rounded-full object-cover mr-2"
                    />
                  )}
                  <span className="py-1">{item.name}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
