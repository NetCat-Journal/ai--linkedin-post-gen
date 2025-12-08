import SkeletonCard from "./skeletonCard";

function Skeleton() {
  return (
    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-3 auto-rows-fr w-full ">
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

export default Skeleton;