import { FadeIn } from './FadeIn';

export function PageLoader() {
  return (
    <div className="min-h-[60vh] grid place-items-center px-4">
      <FadeIn className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-800" />
          <div className="absolute inset-0 rounded-full border-2 border-bd-green-600 border-t-transparent animate-spin" />
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">লোড হচ্ছে...</p>
      </FadeIn>
    </div>
  );
}
