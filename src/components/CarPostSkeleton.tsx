export function CarPostSkeleton() {
  return (
    <div className="card-outline rounded-xl2 bg-base-surface overflow-hidden animate-pulse">
      {/* Фото */}
      <div className="w-full h-56 bg-base-raised" />
      <div className="p-4">
        {/* Заголовок */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-base-raised rounded-full w-2/3" />
            <div className="h-3 bg-base-raised rounded-full w-1/4" />
          </div>
          <div className="text-right space-y-2">
            <div className="h-3 bg-base-raised rounded-full w-20" />
            <div className="h-3 bg-base-raised rounded-full w-14 ml-auto" />
          </div>
        </div>
        {/* Описание */}
        <div className="mt-3 space-y-1.5">
          <div className="h-3 bg-base-raised rounded-full w-full" />
          <div className="h-3 bg-base-raised rounded-full w-3/4" />
        </div>
        {/* Действия */}
        <div className="mt-3.5 pt-3 border-t border-base-line flex items-center gap-4">
          <div className="h-4 bg-base-raised rounded-full w-10" />
          <div className="h-4 bg-base-raised rounded-full w-6" />
        </div>
      </div>
    </div>
  );
}
