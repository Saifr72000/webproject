import React from "react";
import { PageLink, PageTitle } from "../../../_metronic/layout/core";
import { Horizontal } from "./components/Horizontal";

const studyWizardBreadCrumbs: Array<PageLink> = [
  {
    title: "Study Management",
    path: "/study",
    isSeparator: false,
    isActive: false,
  },
  {
    title: "Create New Study",
    path: "/create-study",
    isSeparator: false,
    isActive: true,
  },
  {
    title: "",
    path: "",
    isSeparator: true,
    isActive: false,
  },
];

const CreateStudyPage = () => {
  return (
    <>
      <PageTitle breadcrumbs={studyWizardBreadCrumbs}>
        Create New Study
      </PageTitle>
      {/* Use the existing Horizontal wizard component with toolbar hidden */}
      <Horizontal hideToolbar={true} />
    </>
  );
};

export default CreateStudyPage;
