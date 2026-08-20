export function Picker<T extends string>({
  items = [],
  selectedItem,
  onSelect,
}: {
  items: Array<T>;
  selectedItem: T;
  onSelect: (item: T) => void;
}) {
  if (!items) {
    return;
  }

  return (
    <article
      style={{
        padding: "24px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 12,
        maxHeight: "300px",
        overflowY: "scroll",
        scrollBehavior: "smooth",
        scrollbarWidth: "none",
      }}
    >
      {((items as Array<T>) ?? []).map(function (item) {
        return (
          <label
            key={item}
            htmlFor={item}
            className={`grow cursor-pointer inline-flex px-2 py-1 text-center items-center
                        justify-center rounded-md text-xs h-10 shadow-md shadow-black/10
                        ${
                          item === selectedItem
                            ? "bg-white text-layout-raised font-semibold"
                            : "bg-layout-raised text-text-normal"
                        }`}
          >
            <input
              type="radio"
              id={item}
              style={{ display: "none" }}
              onChange={function () {
                onSelect(item);
              }}
              checked={item === selectedItem}
              value={item}
            />
            {item}
          </label>
        );
      })}
    </article>
  );
}
