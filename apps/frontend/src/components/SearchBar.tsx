import {
  searchAll,
  SearchItemDto,
  SearchItemType,
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
  >({ user: [], action: [], post: [] });
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const categories: SearchItemType[] = ["user", "action", "post"];
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const categoryNames: Record<SearchItemType, string> = {
    user: "Users",
    action: "Actions",
    post: "Posts",
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(true);
    setSearch(e.target.value);
  };

  const fetchItems = useCallback(async () => {
    const res = await searchAll({ query: { query: search } });
    if (res.data) {
      const itemsByCategory = res.data.reduce(
        (acc, item) => {
          acc[item.type] = [...(acc[item.type] || []), item];
          return acc;
        },
        { user: [], action: [], post: [] } as Record<
          SearchItemType,
          SearchItemDto[]
        >
      );

      console.log(itemsByCategory);

      const itemsInOrder = [
        ...itemsByCategory.user,
        ...itemsByCategory.action,
        ...itemsByCategory.post,
      ];

      setItems(itemsInOrder);
      setItemsByCategory(itemsByCategory);

      if (itemsInOrder.length > 0) {
        setSelectedItemId(itemsInOrder[0].id);
      } else {
        setSelectedItemId(null);
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
    setSelectedItemId(null);
  }, []);

  const handleItemClick = useCallback(
    (item: SearchItemDto) => {
      console.log(item);
      if (item.webAppLocation) {
        navigate(item.webAppLocation);
        close();
      }
    },
    [navigate, close]
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

  const handleSubmit = useCallback(() => {
    if (selectedItemId) {
      handleItemClick(items.find((item) => item.id === selectedItemId)!);
    }
  }, [selectedItemId, handleItemClick, items]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handleSubmit();
      }
      if (e.key === "Escape") {
        close();
      }
      if (e.key === "ArrowUp") {
        if (selectedItemId) {
          const index = items.findIndex((item) => item.id === selectedItemId);
          if (index > 0) {
            setSelectedItemId(items[index - 1].id);
            itemRefs.current[items[index - 1].id]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        if (selectedItemId) {
          const index = items.findIndex((item) => item.id === selectedItemId);
          if (index < items.length - 1) {
            setSelectedItemId(items[index + 1].id);
            itemRefs.current[items[index + 1].id]?.scrollIntoView({
              behavior: "smooth",
              block: "nearest",
            });
          }
        }
        e.preventDefault();
      }
    },
    [handleSubmit, close, selectedItemId, items]
  );

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
        onKeyDown={handleKeyDown}
      />
      {open && items.length > 0 && (
        <div className="w-full bg-zinc-100 -mt-[3px] pt-[7px] shrink-0 rounded-b-md p-2 flex flex-col max-h-[min(calc(100vh-50px),400px)] overflow-y-auto">
          {categoriesWithItems.map((category) => (
            <div key={category} className=" w-full">
              <p className="text-black text-sm font-medium pl-3 pt-3 w-full border-t border-zinc-200">
                {categoryNames[category]}
              </p>
              {itemsByCategory[category]?.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  ref={(el) => {
                    itemRefs.current[item.id] = el;
                  }}
                  className={`text-black hover:bg-zinc-200 p-3 rounded-md flex flex-row justify-start cursor-pointer items-center ${
                    selectedItemId === item.id ? "bg-zinc-200" : ""
                  }`}
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
