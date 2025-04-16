import React, { useState, useMemo, useEffect } from "react";
import { Card2 } from "../../../../_metronic/partials/content/cards/Card2";
import { IconUserModel } from "../ProfileModels";
import { KTIcon } from "../../../../_metronic/helpers";
import { Link } from "react-router-dom";
import { mockStudies } from "../../../../data/mockStudies";

// Define study data type
type Study = {
  id: number;
  icon: string;
  badgeColor: string;
  status: string;
  statusColor: string;
  title: string;
  description: string;
  date: string;
  budget: string;
  progress: number;
  users: Array<IconUserModel>;
};

export function Studies() {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [statusFilter, setStatusFilter] = useState("All");
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Show searching indicator
  useEffect(() => {
    if (searchTerm !== debouncedSearchTerm) {
      setIsSearching(true);
    }
  }, [searchTerm, debouncedSearchTerm]);

  // Map mock studies to the format needed by Card2
  const allStudies: Study[] = useMemo(
    () =>
      mockStudies.map((study) => {
        let statusColor = "primary";
        let badgeColor = "primary";

        // Set appropriate colors based on status
        switch (study.status) {
          case "completed":
            statusColor = "success";
            badgeColor = "success";
            break;
          case "draft":
            statusColor = "info";
            badgeColor = "info";
            break;
          case "paused":
            statusColor = "warning";
            badgeColor = "warning";
            break;
          default:
            statusColor = "primary";
            badgeColor = "primary";
        }

        // Generate users array for the study
        let userList: Array<IconUserModel> = [];
        if (study.leadResearcher) {
          userList = [
            {
              name: study.leadResearcher.name,
              avatar: study.leadResearcher.avatar,
            },
          ];
        }

        // Format date from ISO to more readable format
        const date = new Date(study.created);
        const formattedDate = date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        return {
          id: study.id,
          icon: "media/svg/brand-logos/plurk.svg", // Default icon
          badgeColor: badgeColor,
          status: study.status.charAt(0).toUpperCase() + study.status.slice(1), // Capitalize first letter
          statusColor: statusColor,
          title: study.name,
          description: study.description,
          date: formattedDate,
          budget: study.entries ? study.entries.name : "",
          progress: study.progress,
          users: userList,
        };
      }),
    []
  );

  // Filter studies based on status filter and search term
  const filteredStudies = useMemo(() => {
    // Initial filter by status
    let filtered = allStudies;
    if (statusFilter !== "All") {
      filtered = filtered.filter((study) => study.status === statusFilter);
    }

    // Then filter by search term if it exists
    if (debouncedSearchTerm.trim() !== "") {
      const searchTermLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(
        (study) =>
          study.title.toLowerCase().includes(searchTermLower) ||
          study.description.toLowerCase().includes(searchTermLower)
      );
    }

    return filtered;
  }, [allStudies, statusFilter, debouncedSearchTerm]);

  // Get total number of pages
  const totalPages = Math.ceil(filteredStudies.length / itemsPerPage);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, debouncedSearchTerm]);

  // Get current studies
  const currentStudies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredStudies.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredStudies, currentPage, itemsPerPage]);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle status filter change
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  // Generate page numbers
  const pageNumbers = [];
  // Always show first page
  if (totalPages > 0) {
    pageNumbers.push(1);
  }

  // Show ellipsis for larger page ranges
  if (currentPage > 3) {
    pageNumbers.push("ellipsis1");
  }

  // Show pages around current page
  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i++
  ) {
    if (i > 1 && i < totalPages) {
      pageNumbers.push(i);
    }
  }

  // Show ellipsis for larger page ranges
  if (currentPage < totalPages - 2) {
    pageNumbers.push("ellipsis2");
  }

  // Always show last page if there is more than one page
  if (totalPages > 1) {
    pageNumbers.push(totalPages);
  }

  return (
    <>
      <div className="d-flex flex-wrap flex-stack mb-6">
        {/* Search bar replaces "My Studies" heading */}
        <div className="position-relative d-flex align-items-center">
          <KTIcon
            iconName="magnifier"
            className="fs-1 position-absolute ms-6 z-index-1"
          />
          <input
            type="text"
            className="form-control form-control-solid w-250px ps-14"
            placeholder="Search Studies"
            value={searchTerm}
            onChange={handleSearchChange}
            style={{ backgroundColor: "#f5f8fa" }}
          />
          {isSearching && (
            <span
              className="position-absolute spinner-border spinner-border-sm text-primary me-4"
              style={{ right: 0 }}
            ></span>
          )}
        </div>

        <div className="d-flex flex-wrap my-2">
          {/* Status Filter */}
          <div className="me-4">
            <select
              name="status"
              data-control="select2"
              data-hide-search="true"
              className="form-select form-select-sm form-select-solid w-125px"
              value={statusFilter}
              onChange={handleStatusChange}
              style={{ backgroundColor: "#f5f8fa" }}
            >
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
              <option value="Completed">Completed</option>
              <option value="Paused">Paused</option>
            </select>
          </div>
          <Link to="/create-study" className="btn btn-primary btn-sm">
            New Study
          </Link>
        </div>
      </div>

      {/* Show message when no results are found */}
      {filteredStudies.length === 0 ? (
        <div className="card">
          <div className="card-body py-15 text-center">
            <KTIcon iconName="information-5" className="fs-5x text-gray-300" />
            <h3 className="mt-5 text-gray-800 fw-bold">
              No matching studies found
            </h3>
            <div className="text-muted mt-3 fs-5">
              Try adjusting your search or filter to find what you're looking
              for.
            </div>
          </div>
        </div>
      ) : (
        <div className="row g-6 g-xl-9">
          {currentStudies.map((study) => (
            <div className="col-md-6 col-xl-4" key={study.id}>
              <Card2
                icon={study.icon}
                badgeColor={study.badgeColor}
                status={study.status}
                statusColor={study.statusColor}
                title={study.title}
                description={study.description}
                date={study.date}
                budget={study.budget}
                progress={study.progress}
                users={study.users}
                id={study.id}
              />
            </div>
          ))}
        </div>
      )}

      {/* Only show pagination if we have studies */}
      {filteredStudies.length > 0 && (
        <div className="d-flex flex-stack flex-wrap pt-10">
          <div className="fs-6 fw-bold text-gray-700">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
            {Math.min(currentPage * itemsPerPage, filteredStudies.length)} of{" "}
            {filteredStudies.length} entries
            <select
              className="form-select form-select-sm ms-4 d-inline-block w-75px"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="9">9</option>
              <option value="12">12</option>
            </select>
          </div>

          <ul className="pagination">
            <li
              className={`page-item previous ${
                currentPage === 1 ? "disabled" : ""
              }`}
            >
              <a
                href="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage - 1);
                }}
              >
                <i className="previous"></i>
              </a>
            </li>

            {pageNumbers.map((page, index) => {
              if (page === "ellipsis1" || page === "ellipsis2") {
                return (
                  <li className="page-item" key={page}>
                    <span className="page-link">...</span>
                  </li>
                );
              }

              return (
                <li
                  className={`page-item ${
                    currentPage === page ? "active" : ""
                  }`}
                  key={index}
                >
                  <a
                    href="#"
                    className="page-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(Number(page));
                    }}
                  >
                    {page}
                  </a>
                </li>
              );
            })}

            <li
              className={`page-item next ${
                currentPage === totalPages ? "disabled" : ""
              }`}
            >
              <a
                href="#"
                className="page-link"
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(currentPage + 1);
                }}
              >
                <i className="next"></i>
              </a>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
