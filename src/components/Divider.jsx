export const Divider = ({text="Articles in this series"}) => (
  <div className="my-10 flex flex-col items-center justify-center">
    <hr className="w-full border-t dark:border-slate-800" />
    <p className="-mt-5 bg-white p-2 font-medium text-slate-600 dark:text-slate-400">
      {text}
    </p>
  </div>
);
