import React, { useState, useEffect } from "react";

const SearchBar = ({ onSearch, placeholder }) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      onSearch(value);
    }, 500); // 👈 ahora medio segundo
    return () => clearTimeout(handler);
  }, [value, onSearch]);


  return (
    <div className="relative flex-grow">
      <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      <input
        type="text"
        placeholder={placeholder}
        className="border pl-10 pr-3 py-2 w-full rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;

