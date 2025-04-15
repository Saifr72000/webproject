import React from "react";
import { PageLink, PageTitle } from "../../../_metronic/layout/core";
import { Studies } from "../../modules/profile/components/Studies";

const studyBreadcrumbs: Array<PageLink> = [
  {
    title: "Study Management",
    path: "/study",
    isSeparator: false,
    isActive: false,
  },
  {
    title: "",
    path: "",
    isSeparator: true,
    isActive: false,
  },
];

/**
 * StudyPageWrapper component - Displays a list of studies
 *
 * This component utilizes the Studies component which has been enhanced with:
 * 1. Proper pagination functionality
 * 2. Filtering by status
 * 3. Customizable items per page
 * 4. Dynamic page number generation with ellipsis for larger page ranges
 * 5. Searchbar with AJAX-like functionality for instant filtering
 * 6. Debounced search to optimize performance
 * 7. Visual feedback during search operations
 * 8. Empty state handling when no results are found
 */
const StudyPageWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={studyBreadcrumbs}>Studies</PageTitle>
      {/* 
        The Studies component has been enhanced with:
        - Proper pagination that adapts to filtered results
        - AJAX-like search functionality for finding studies by title/description
        - Status filtering to categorize studies
        - Customizable number of items per page
        - Visual feedback during search with loading indicator
        - Empty state handling when no search results match
      */}
      <Studies />
    </>
  );
};

export default StudyPageWrapper;
