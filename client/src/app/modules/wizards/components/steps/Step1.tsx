import { FC } from "react";
import { KTIcon } from "../../../../../_metronic/helpers";
import { ErrorMessage, Field } from "formik";

const Step1: FC = () => {
  return (
    <div className="w-100">
      <div className="pb-10 pb-lg-15">
        <h2 className="fw-bolder d-flex align-items-center text-gray-900">
          Choose Study Type
          <i
            className="fas fa-exclamation-circle ms-2 fs-7"
            data-bs-toggle="tooltip"
            title="Select the type of study you want to create"
          ></i>
        </h2>

        <div className="text-gray-500 fw-bold fs-6">
          If you need more info, please check out
          <a href="/dashboard" className="link-primary fw-bolder">
            {" "}
            Help Page
          </a>
          .
        </div>
      </div>

      <div className="fv-row">
        <div className="row">
          <div className="col-lg-6">
            <Field
              type="radio"
              className="btn-check"
              name="accountType"
              value="clinical"
              id="kt_create_account_form_account_type_clinical"
            />
            <label
              className="btn btn-outline btn-outline-dashed btn-outline-default p-7 d-flex align-items-center mb-10"
              htmlFor="kt_create_account_form_account_type_clinical"
            >
              <KTIcon iconName="profile-circle" className="fs-3x me-5" />

              <span className="d-block fw-bold text-start">
                <span className="text-gray-900 fw-bolder d-block fs-4 mb-2">
                  Clinical Study
                </span>
                <span className="text-gray-500 fw-bold fs-6">
                  Medical research involving human participants
                </span>
              </span>
            </label>
          </div>

          <div className="col-lg-6">
            <Field
              type="radio"
              className="btn-check"
              name="accountType"
              value="observational"
              id="kt_create_account_form_account_type_observational"
            />
            <label
              className="btn btn-outline btn-outline-dashed btn-outline-default p-7 d-flex align-items-center"
              htmlFor="kt_create_account_form_account_type_observational"
            >
              <KTIcon iconName="eye" className="fs-3x me-5" />

              <span className="d-block fw-bold text-start">
                <span className="text-gray-900 fw-bolder d-block fs-4 mb-2">
                  Observational Study
                </span>
                <span className="text-gray-500 fw-bold fs-6">
                  Study where participants are observed without intervention
                </span>
              </span>
            </label>
          </div>

          <div className="col-lg-6 mt-8">
            <Field
              type="radio"
              className="btn-check"
              name="accountType"
              value="survey"
              id="kt_create_account_form_account_type_survey"
            />
            <label
              className="btn btn-outline btn-outline-dashed btn-outline-default p-7 d-flex align-items-center"
              htmlFor="kt_create_account_form_account_type_survey"
            >
              <KTIcon iconName="notepad" className="fs-3x me-5" />

              <span className="d-block fw-bold text-start">
                <span className="text-gray-900 fw-bolder d-block fs-4 mb-2">
                  Survey Study
                </span>
                <span className="text-gray-500 fw-bold fs-6">
                  Collection of data through questionnaires
                </span>
              </span>
            </label>
          </div>

          <div className="col-lg-6 mt-8">
            <Field
              type="radio"
              className="btn-check"
              name="accountType"
              value="experimental"
              id="kt_create_account_form_account_type_experimental"
            />
            <label
              className="btn btn-outline btn-outline-dashed btn-outline-default p-7 d-flex align-items-center"
              htmlFor="kt_create_account_form_account_type_experimental"
            >
              <KTIcon iconName="flask" className="fs-3x me-5" />

              <span className="d-block fw-bold text-start">
                <span className="text-gray-900 fw-bolder d-block fs-4 mb-2">
                  Experimental Study
                </span>
                <span className="text-gray-500 fw-bold fs-6">
                  Study involving manipulation of variables and control groups
                </span>
              </span>
            </label>
          </div>

          <div className="text-danger mt-2">
            <ErrorMessage name="accountType" />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Step1 };
