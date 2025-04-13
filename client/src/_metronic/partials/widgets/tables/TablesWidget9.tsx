import React from "react";
import { KTIcon, toAbsoluteUrl } from "../../../helpers";
import { mockStudies } from "../../../../data/mockStudies";
import { Link } from "react-router-dom";

type Props = {
  className: string;
};

const TablesWidget9: React.FC<Props> = ({ className }) => {
  // Get the first 5 studies for the dashboard overview
  const dashboardStudies = mockStudies.slice(0, 5);

  // Generate random entry numbers for each study (between 5 and 20)
  const entryNumbers = dashboardStudies.map(
    () => Math.floor(Math.random() * 16) + 5
  );

  return (
    <div className={`card ${className}`}>
      {/* begin::Header */}
      <div className="card-header border-0 pt-5">
        <h3 className="card-title align-items-start flex-column">
          <span className="card-label fw-bold fs-3 mb-1">Study Overview</span>
        </h3>
        <div
          className="card-toolbar"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          data-bs-trigger="hover"
          title="Create a new study"
        >
          <Link to="/create-study" className="btn btn-sm btn-light-primary">
            <KTIcon iconName="plus" className="fs-3" />
            New Study
          </Link>
        </div>
      </div>
      {/* end::Header */}
      {/* begin::Body */}
      <div className="card-body py-3">
        {/* begin::Table container */}
        <div className="table-responsive">
          {/* begin::Table */}
          <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-6">
            {/* begin::Table head */}
            <thead>
              <tr className="fw-bold text-muted">
                <th className="w-25px">
                  <div className="form-check form-check-sm form-check-custom form-check-solid">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      value="1"
                      data-kt-check="true"
                      data-kt-check-target=".widget-9-check"
                    />
                  </div>
                </th>
                <th className="min-w-150px">Name</th>
                <th className="min-w-140px">Entries</th>
                <th className="min-w-120px">Created</th>
                <th className="min-w-100px text-end">Actions</th>
              </tr>
            </thead>
            {/* end::Table head */}
            {/* begin::Table body */}
            <tbody>
              {/* Use map function to generate rows from mockStudies */}
              {dashboardStudies.map((study, index) => {
                // Format the date
                const date = new Date(study.created);
                const formattedDate = date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                });

                // Set status color
                let statusBadgeClass = "badge-light-primary";
                if (study.status === "completed") {
                  statusBadgeClass = "badge-light-success";
                } else if (study.status === "draft") {
                  statusBadgeClass = "badge-light-info";
                } else if (study.status === "paused") {
                  statusBadgeClass = "badge-light-warning";
                }

                return (
                  <tr key={study.id} className="py-5">
                    <td className="py-3">
                      <div className="form-check form-check-sm form-check-custom form-check-solid">
                        <input
                          className="form-check-input widget-9-check"
                          type="checkbox"
                          value="1"
                        />
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <div className="symbol symbol-45px me-5">
                          <img
                            src={toAbsoluteUrl("/media/avatars/blank.png")}
                            alt=""
                          />
                        </div>
                        <div className="d-flex justify-content-start flex-column">
                          <Link
                            to={`/study/${study.id}`}
                            className="text-gray-900 fw-bold text-hover-primary fs-6"
                          >
                            {study.name}
                          </Link>
                          <div className="mt-1">
                            <span
                              className={`badge ${statusBadgeClass} fw-bold fs-8`}
                            >
                              {study.status.charAt(0).toUpperCase() +
                                study.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-900 fw-bold fs-6">
                        {entryNumbers[index]}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-gray-800 fw-bold fs-6">
                        {formattedDate}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="d-flex justify-content-end flex-shrink-0">
                        <Link
                          to={`/study/${study.id}`}
                          className="btn btn-icon btn-bg-light btn-active-color-primary btn-sm"
                          title="Edit Study"
                        >
                          <KTIcon iconName="pencil" className="fs-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* end::Table body */}
          </table>
          {/* end::Table */}
        </div>
        {/* end::Table container */}
      </div>
      {/* begin::Body */}
    </div>
  );
};

export { TablesWidget9 };
