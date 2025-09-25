import { useMemo } from "react";

const getDisplayPages = (totalPages, currentPage, delta = 2) => {
  if (totalPages <= 1) return [1];

  const pages = [];
  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  pages.push(1);

  if (left > 2) {
    pages.push("left-ellipsis");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < totalPages - 1) {
    pages.push("right-ellipsis");
  }

  if (totalPages > 1) pages.push(totalPages);

  return pages.filter((v, i, a) => a.indexOf(v) === i);
};

const Pagination = ({
  totalPages,
  currentPage,
  onPageChange,
  delta = 2,
  jumpStep = 5,
}) => {
  const pages = useMemo(
    () => getDisplayPages(totalPages, currentPage, delta),
    [totalPages, currentPage, delta]
  );

  const handleEllipsis = (type) => {
    if (type === "left-ellipsis") {
      const target = Math.max(1, currentPage - jumpStep)
      onPageChange(target);
    } else {
      const target = Math.min(totalPages, currentPage + jumpStep);
      onPageChange(target);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <nav
      className="flex justify-center items-center gap-2 mt-4"
      aria-label="Paginación"
    >
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded ${
          currentPage === 1
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-900"
        }`}
      >
       <i className="fa-solid fa-arrow-left text-lg"></i>
      </button>

      {pages.map((p, idx) =>
        p === "left-ellipsis" || p === "right-ellipsis" ? (
          <button
            key={p + "-" + idx}
            onClick={() => handleEllipsis(p)}
            className="px-3 py-1 text-gray-500 hover:text-blue-600"
            title="Saltar"
          >
            ...
          </button>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(Number(p))}
            className={`px-3 py-1 cursor-pointer rounded ${
              currentPage === p
                ? "bg-red-50 text-red-600 font-bold underline"
                : "text-blue-600 hover:text-blue-900"
            }`}
            aria-current={currentPage === p ? "page" : undefined}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded ${
          currentPage === totalPages
            ? "text-gray-400 cursor-not-allowed"
            : "text-blue-600 hover:text-blue-900"
        }`}
      >
         <i className="fa-solid fa-arrow-right text-lg"></i>
      </button>
    </nav>
  );
};

export default Pagination;