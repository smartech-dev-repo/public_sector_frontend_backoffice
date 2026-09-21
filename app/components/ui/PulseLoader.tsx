export default function PulseLoader() {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[bounce_1s_infinite_0ms]"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[bounce_1s_infinite_200ms]"></div>
        <div className="w-3 h-3 rounded-full bg-emerald-500 animate-[bounce_1s_infinite_400ms]"></div>
      </div>
    </div>
  );
}
