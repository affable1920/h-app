import { memo } from "react";
import { Stack } from "./Stack";
import { motion } from "motion/react";

type TabViewProps<T> = {
  tabs: T[];
  currentTab: T;
  setCurrentTab: (tab: T) => void;
  orientation?: "H" | "V";
};

const TabView = memo(function <T>({
  tabs,
  currentTab,
  setCurrentTab,
  orientation = "H",
}: TabViewProps<T>) {
  return (
    <Stack
      orientation={orientation}
      align="center"
      className="border border-border-vivid rounded-md shadow-md shadow-black/30 
        overflow-hidden w-fit text-sm p-1"
    >
      {tabs.map((tab, i) => {
        return (
          <motion.div
            animate={{
              background:
                tab === currentTab ? "var(--color-layout-raised)" : "",
              color: tab === currentTab ? "var(--color-text)" : "",
            }}
            className={`capitalize cursor-pointer rounded-md px-3 py-1 font-semibold hover:bg-layout 
                hover:text-text-normal`}
            key={tab + i.toString()}
            onClick={function () {
              setCurrentTab(tab);
            }}
          >
            {tab as string}
          </motion.div>
        );
      })}
    </Stack>
  );
});

export default TabView;
