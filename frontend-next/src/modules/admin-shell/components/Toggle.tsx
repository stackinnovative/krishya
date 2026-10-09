/** Admin on/off switch (green when on). Usually placed in a clickable row that toggles the same value. */
export default function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <div onClick={onClick} className="relative h-[22px] w-10 flex-none cursor-pointer rounded-full" style={{ background: on ? "#3fbf5f" : "#d9d9d5", transition: "background .2s" }}>
      <div className="absolute top-0.5 h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,.2)]" style={{ left: on ? 20 : 2, transition: "left .2s" }} />
    </div>
  );
}
