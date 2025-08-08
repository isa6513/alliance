import {
  searchAll,
  SearchItemDto,
  SearchItemType,
  searchSaveSelected,
} from "@alliance/shared/client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";

const SearchBar = () => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const [items, setItems] = useState<SearchItemDto[]>([]);
  const [itemsByCategory, setItemsByCategory] = useState<
    Record<SearchItemType, SearchItemDto[]>
  >({ user: [], action: [], post: [], recent: [] });
  const [selectedItem, setSelectedItem] = useState<SearchItemDto | null>(null);
  const categories: SearchItemType[] = ["recent", "user", "action", "post"];
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categoryNames: Record<SearchItemType, string> = {
    user: "Users",
    action: "Actions",
    post: "Posts",
    recent: "Recent Searches",
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    setSearch(e.target.value);
  };

  const fetchItems = useCallback(async () => {
    const res = await searchAll({ query: { query: search } });
    if (res.data) {
      const itemsByCategory: Record<SearchItemType, SearchItemDto[]> =
        search.length > 0
          ? res.data.reduce(
              (acc, item) => {
                acc[item.type] = [...(acc[item.type] || []), item];
                return acc;
              },
              { user: [], action: [], post: [], recent: [] } as Record<
                SearchItemType,
                SearchItemDto[]
              >
            )
          : { user: [], action: [], post: [], recent: res.data };

      console.log(itemsByCategory);

      const itemsInOrder = [
        ...itemsByCategory.recent,
        ...itemsByCategory.user,
        ...itemsByCategory.action,
        ...itemsByCategory.post,
      ];

      setItems(itemsInOrder);
      setItemsByCategory(itemsByCategory);

      if (itemsInOrder.length > 0) {
        setSelectedItem(itemsInOrder[0]);
      } else {
        setSelectedItem(null);
      }
    }
  }, [search]);

  useEffect(() => {
    const id = setTimeout(() => {
      fetchItems();
    }, 50);
    return () => clearTimeout(id);
  }, [search, fetchItems]);

  const categoriesWithItems = categories.filter(
    (category) => itemsByCategory[category]?.length > 0
  );

  const close = useCallback(() => {
    setOpen(false);
    setSearch("");
    setSelectedItem(null);
  }, []);

  const divRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChooseItem = useCallback(
    (item: SearchItemDto) => {
      console.log("saving item", item);
      searchSaveSelected({ body: item });
      inputRef.current?.blur();
      navigate(item.webAppLocation);
      close();
    },
    [navigate, close]
  );

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

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && selectedItem) {
        handleChooseItem(selectedItem);
      }
      if (e.key === "Escape") {
        close();
      }
      if (e.key === "ArrowUp") {
        if (selectedItem) {
          const index = items.findIndex((item) => item.id === selectedItem.id);
          if (index > 0) {
            setSelectedItem(items[index - 1]);
            itemRefs.current[items[index - 1].id]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        if (selectedItem) {
          const index = items.findIndex((item) => item.id === selectedItem.id);
          if (index < items.length - 1) {
            setSelectedItem(items[index + 1]);
            itemRefs.current[items[index + 1].id]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
        e.preventDefault();
      }
    },
    [close, selectedItem, items, handleChooseItem]
  );

  const handleGlobalKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log("global key down", e.key, e.ctrlKey);
      if (e.key === "k" && e.metaKey) {
        setOpen(true);
        inputRef.current?.focus();
        setSelectedItem(items[0]);
      }
    },
    [items]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [open, handleGlobalKeyDown]);

  return (
    <div
      ref={divRef}
      className="relative flex-1 max-w-[500px] flex flex-col overflow-visible h-[37.5px] rounded-md"
    >
      <input
        type="text"
        placeholder="Search"
        className="w-full bg-zinc-100 p-2 px-3 rounded-lg focus:outline-none"
        value={search}
        onChange={onChange}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        ref={inputRef}
      />
      {open && items.length > 0 && (
        <div className="w-full bg-zinc-100 -mt-[3px] pt-[7px] shrink-0 rounded-b-md p-2 flex flex-col max-h-[min(calc(100vh-50px),400px)] overflow-y-auto">
          {categoriesWithItems.map((category) => (
            <div key={category} className=" w-full">
              <p className="text-black text-sm font-medium pl-3 pt-3 pb-1 w-full border-t border-zinc-200">
                {categoryNames[category]}
              </p>
              {itemsByCategory[category]?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleChooseItem(item)}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  className={`text-black hover:bg-zinc-200 p-3 rounded-md flex flex-row justify-start cursor-pointer items-center ${
                    selectedItem?.id === item.id ? "bg-zinc-200" : ""
                  }`}
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="aspect-square h-8 rounded-full object-cover mr-2"
                    />
                  )}
                  <div className="flex flex-col">
                    <span>{item.name}</span>
                    {item.secondaryData && (
                      <span className="text-xs text-zinc-500">
                        {item.secondaryData.join(", ")}
                      </span>
                    )}
                  </div>
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
