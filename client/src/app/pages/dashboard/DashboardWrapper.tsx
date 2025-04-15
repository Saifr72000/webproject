import { EnableSidebar, PageTitle } from "../../../_metronic/layout/core";
import {
  ListsWidget4,
  ListsWidget5,
  TablesWidget9,
  MixedWidget13,
  MixedWidget14,
  MixedWidget15,
} from "../../../_metronic/partials/widgets";
import { UsersTable } from "../../modules/apps/user-management/users-list/table/UsersTable";
import { UsersList } from "../../modules/profile/components/UsersList";
import { mockStudies } from "../../../data/mockStudies";

const DashboardPage = () => {
  // Calculate study statistics
  const activeStudiesCount = mockStudies.filter(
    (study) => study.status === "active"
  ).length;
  const totalStudiesCount = mockStudies.length;

  // Calculate total participants (sum of progress values as a simple mock)
  const totalParticipants = mockStudies.reduce((total, study) => {
    // For this example, we'll use the progress as a simple way to calculate participants
    return total + Math.round(study.progress / 10); // Just a way to get a reasonable number
  }, 0);

  return (
    <>
      <div className="row gy-5 g-xl-10">
        {/*begin::Col*/}
        <div className="col-xl-4">
          <MixedWidget13
            className="card-xl-stretch mb-xl-10"
            backGroundColor="#F7D9E3"
            chartHeight="100px"
            title="Total active studies"
            value={activeStudiesCount.toString()}
          />
        </div>
        {/*end::Col*/}

        {/*begin::Col*/}
        <div className="col-xl-4">
          <MixedWidget14
            className="card-xl-stretch mb-xl-10"
            backGroundColor="#CBF0F4"
            chartHeight="100px"
            title="Total participants"
            value={totalParticipants.toString()}
          />
        </div>
        {/*end::Col*/}

        {/*begin::Col*/}
        <div className="col-xl-4">
          <MixedWidget13
            className="card-xl-stretch mb-xl-10"
            backGroundColor="#CBD4F4"
            chartHeight="100px"
            title="Total number of studies"
            value={totalStudiesCount.toString()}
          />
        </div>
        {/*end::Col*/}
      </div>
      {/*end::Row*/}

      <TablesWidget9 className="mb-5 mb-xl-10" />
    </>
  );
};

const DashboardWrapper = () => {
  return (
    <EnableSidebar>
      <PageTitle description="Welcome back to StudiFi" breadcrumbs={[]}>
        Hello, Saif
      </PageTitle>
      <DashboardPage />
    </EnableSidebar>
  );
};

export { DashboardWrapper };
