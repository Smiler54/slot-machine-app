import SlotMachine from "@/components/SlotMachine";

export default function Home() {
  return (
    <div
      className={`min-h-screen`}
    >
      <main className="flex flex-col gap-[32px] items-center">
        <SlotMachine />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
