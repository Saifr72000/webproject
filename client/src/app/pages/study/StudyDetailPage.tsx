import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { PageLink, PageTitle } from "../../../_metronic/layout/core";
import { KTIcon } from "../../../_metronic/helpers";
import { IconUserModel } from "../../modules/profile/ProfileModels";

// Define study type
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
  // Additional fields for study details
  leadResearcher?: string;
  estimatedParticipants?: string;
  startMonth?: string;
  endYear?: string;
  location?: string;
  type?: string;
  questions?: Question[];
};

// Question type
type Question = {
  id: string;
  text: string;
  type: string;
  options: { type: string; label: string }[];
  correctAnswer: string;
};

// Mock data for users
const mockUsers = [
  { name: "Emma Smith", avatar: "media/avatars/300-6.jpg" },
  { name: "Rudy Stone", avatar: "media/avatars/300-1.jpg" },
  { name: "Susan Redwood", initials: "S", color: "primary" },
];

const studyBreadcrumbs: Array<PageLink> = [
  {
    title: "Study Management",
    path: "/study",
    isSeparator: false,
    isActive: false,
  },
  {
    title: "Study Details",
    path: "",
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

const StudyDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // In a real application, fetch the study data from an API
    // For now, we'll mock the data
    const fetchStudy = () => {
      setLoading(true);

      // Check localStorage first
      try {
        const storedStudies = localStorage.getItem("studies");
        if (storedStudies) {
          const parsedStudies = JSON.parse(storedStudies);
          const foundStudy = parsedStudies.find(
            (s: any, index: number) => index === Number(id) - 1
          );

          if (foundStudy) {
            const mockQuestions = [
              {
                id: "q1",
                text: "Which of these is AI-generated?",
                type: "single",
                options: [
                  { type: "stimulus", label: "Option 1" },
                  { type: "text", label: "Option 2" },
                ],
                correctAnswer: "1",
              },
              {
                id: "q2",
                text: "Identify the correct pattern:",
                type: "multiple",
                options: [
                  { type: "stimulus", label: "Pattern A" },
                  { type: "stimulus", label: "Pattern B" },
                  { type: "stimulus", label: "Pattern C" },
                ],
                correctAnswer: "2",
              },
            ];

            setStudy({
              id: Number(id),
              icon: `media/svg/brand-logos/plurk.svg`,
              badgeColor: foundStudy.status === "draft" ? "info" : "primary",
              status: foundStudy.status === "draft" ? "Draft" : "Active",
              statusColor: foundStudy.status === "draft" ? "info" : "primary",
              title: foundStudy.title || "Untitled Study",
              description: foundStudy.description || "No description provided",
              date: new Date(foundStudy.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
              budget: `${foundStudy.estimatedParticipants || "0"} participants`,
              progress: foundStudy.status === "draft" ? 30 : 70,
              users: mockUsers,
              leadResearcher: foundStudy.leadResearcher,
              estimatedParticipants: foundStudy.estimatedParticipants,
              startMonth: foundStudy.startMonth,
              endYear: foundStudy.endYear,
              location: foundStudy.location,
              type: foundStudy.type,
              questions: foundStudy.stimuli || mockQuestions,
            });
            setLoading(false);
            return;
          }
        }
      } catch (error) {
        console.error("Error loading study from localStorage:", error);
      }

      // If not found in localStorage, load mock data
      setTimeout(() => {
        const mockStudy: Study = {
          id: Number(id),
          icon: "media/svg/brand-logos/plurk.svg",
          badgeColor: "primary",
          status: "In Progress",
          statusColor: "primary",
          title: "Fitnes App",
          description: "CRM App application to HR efficiency",
          date: "November 10, 2021",
          budget: "284 participants",
          progress: 50,
          users: mockUsers,
          leadResearcher: "Dr. John Smith",
          estimatedParticipants: "284",
          startMonth: "January",
          endYear: "2022",
          location: "New York",
          type: "clinical",
          questions: [
            {
              id: "q1",
              text: "Which of these is AI-generated?",
              type: "single",
              options: [
                { type: "stimulus", label: "Option 1" },
                { type: "text", label: "Option 2" },
              ],
              correctAnswer: "1",
            },
            {
              id: "q2",
              text: "Identify the correct pattern:",
              type: "multiple",
              options: [
                { type: "stimulus", label: "Pattern A" },
                { type: "stimulus", label: "Pattern B" },
                { type: "stimulus", label: "Pattern C" },
              ],
              correctAnswer: "2",
            },
          ],
        };
        setStudy(mockStudy);
        setLoading(false);
      }, 500);
    };

    fetchStudy();
  }, [id]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-h-350px">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!study) {
    return (
      <div className="card">
        <div className="card-body py-15 text-center">
          <KTIcon iconName="information-5" className="fs-5x text-gray-300" />
          <h3 className="mt-5 text-gray-800 fw-bold">Study not found</h3>
          <div className="text-muted mt-3 fs-5">
            The study you're looking for doesn't exist or has been removed.
          </div>
          <Link to="/study" className="btn btn-primary mt-5">
            Back to Studies
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageTitle breadcrumbs={studyBreadcrumbs}>{study.title}</PageTitle>

      {/* Study Header */}
      <div className="card mb-5 mb-xl-10">
        <div className="card-body pt-9 pb-0">
          {/* Header */}
          <div className="d-flex flex-wrap flex-sm-nowrap mb-3">
            {/* Icon */}
            <div className="me-7 mb-4">
              <div className="symbol symbol-100px symbol-lg-160px symbol-fixed position-relative">
                <div className="symbol symbol-50px w-50px bg-light">
                  <img
                    src={require(`../../../../_metronic/assets/${study.icon}`)}
                    alt={study.title}
                    className="p-3"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="flex-grow-1">
              <div className="d-flex justify-content-between align-items-start flex-wrap mb-2">
                {/* Title */}
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <span className="text-gray-900 text-hover-primary fs-2 fw-bolder me-1">
                      {study.title}
                    </span>
                    <span
                      className={`badge badge-light-${study.statusColor} fw-bolder ms-2 fs-8 py-1 px-3`}
                    >
                      {study.status}
                    </span>
                  </div>

                  <div className="d-flex flex-wrap fw-bold fs-6 mb-4 pe-2">
                    <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                      <KTIcon iconName="compass" className="fs-4 me-1" />
                      {study.location || "Not specified"}
                    </span>
                    <span className="d-flex align-items-center text-gray-500 text-hover-primary me-5 mb-2">
                      <KTIcon iconName="calendar" className="fs-4 me-1" />
                      Due: {study.date}
                    </span>
                    <span className="d-flex align-items-center text-gray-500 text-hover-primary mb-2">
                      <KTIcon iconName="profile-circle" className="fs-4 me-1" />
                      {study.leadResearcher || "Not specified"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="d-flex my-4">
                  <Link
                    to={`/create-study`}
                    className="btn btn-sm btn-light me-3"
                  >
                    <KTIcon iconName="pencil" className="fs-3" />
                    Edit
                  </Link>
                  <button className="btn btn-sm btn-primary">
                    <KTIcon iconName="message-text-2" className="fs-3" />
                    Publish
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="d-flex flex-wrap flex-stack">
                <div className="d-flex flex-column flex-grow-1 pe-8">
                  <div className="d-flex flex-wrap">
                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon
                          iconName="chart"
                          className="fs-3 text-primary me-2"
                        />
                        <div className="fs-2 fw-bolder">
                          {study.estimatedParticipants || 0}
                        </div>
                      </div>
                      <div className="fw-bold fs-6 text-gray-500">
                        Participants
                      </div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon
                          iconName="questionnaire-tablet"
                          className="fs-3 text-danger me-2"
                        />
                        <div className="fs-2 fw-bolder">
                          {study.questions?.length || 0}
                        </div>
                      </div>
                      <div className="fw-bold fs-6 text-gray-500">
                        Questions
                      </div>
                    </div>

                    <div className="border border-gray-300 border-dashed rounded min-w-125px py-3 px-4 me-6 mb-3">
                      <div className="d-flex align-items-center">
                        <KTIcon
                          iconName="timer"
                          className="fs-3 text-success me-2"
                        />
                        <div className="fs-2 fw-bolder">{study.progress}%</div>
                      </div>
                      <div className="fw-bold fs-6 text-gray-500">
                        Completion
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team members */}
                <div className="d-flex align-items-center w-200px w-sm-300px flex-column mt-3">
                  <div className="d-flex justify-content-between w-100 mt-auto mb-2">
                    <span className="fw-bold fs-6 text-gray-500">
                      Team Members
                    </span>
                  </div>
                  <div className="d-flex justify-content-start w-100">
                    {study.users?.map((user, i) => (
                      <div
                        key={`user-${i}`}
                        className={`symbol symbol-35px symbol-circle ${
                          i < 1 ? "" : "ms-n3"
                        }`}
                      >
                        {user.avatar ? (
                          <img
                            src={require(`../../../../_metronic/assets/${user.avatar}`)}
                            alt={user.name}
                          />
                        ) : (
                          <div
                            className={`symbol-label bg-${user.color} text-inverse-${user.color} fw-bolder`}
                          >
                            {user.initials}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="d-flex overflow-auto h-55px">
            <ul className="nav nav-stretch nav-line-tabs nav-line-tabs-2x border-transparent fs-5 fw-bolder flex-nowrap">
              <li className="nav-item">
                <button
                  className={`nav-link text-active-primary me-6 ${
                    activeTab === "overview" && "active"
                  }`}
                  onClick={() => setActiveTab("overview")}
                >
                  Overview
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-active-primary me-6 ${
                    activeTab === "questions" && "active"
                  }`}
                  onClick={() => setActiveTab("questions")}
                >
                  Questions
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-active-primary me-6 ${
                    activeTab === "statistics" && "active"
                  }`}
                  onClick={() => setActiveTab("statistics")}
                >
                  Statistics
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link text-active-primary me-6 ${
                    activeTab === "settings" && "active"
                  }`}
                  onClick={() => setActiveTab("settings")}
                >
                  Settings
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <div className="card mb-5 mb-xl-10">
          <div className="card-header border-0">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">Study Details</h3>
            </div>
          </div>

          <div className="card-body p-9">
            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Study Title</label>
              <div className="col-lg-8">
                <span className="fw-bolder fs-6 text-gray-800">
                  {study.title}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Description</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.description}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Study Type</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.type || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                Lead Researcher
              </label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.leadResearcher || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Location</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.location || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Start Month</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.startMonth || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">End Year</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.endYear || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">
                Estimated Participants
              </label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">
                  {study.estimatedParticipants || "Not specified"}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Status</label>
              <div className="col-lg-8">
                <span className={`badge badge-light-${study.statusColor}`}>
                  {study.status}
                </span>
              </div>
            </div>

            <div className="row mb-7">
              <label className="col-lg-4 fw-bold text-muted">Created At</label>
              <div className="col-lg-8">
                <span className="fw-bold fs-6 text-gray-800">{study.date}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "questions" && (
        <div className="card mb-5 mb-xl-10">
          <div className="card-header border-0">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">Study Questions</h3>
            </div>
            <div className="card-toolbar">
              <Link to="/create-study" className="btn btn-sm btn-primary">
                <KTIcon iconName="plus" className="fs-3" />
                Add Question
              </Link>
            </div>
          </div>

          <div className="card-body p-9">
            {study.questions && study.questions.length > 0 ? (
              <div className="accordion" id="accordionQuestions">
                {study.questions.map((question, index) => (
                  <div className="accordion-item" key={question.id}>
                    <h2 className="accordion-header" id={`heading${index}`}>
                      <button
                        className="accordion-button fs-4 fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${index}`}
                        aria-expanded={index === 0 ? "true" : "false"}
                        aria-controls={`collapse${index}`}
                      >
                        {index + 1}. {question.text}
                      </button>
                    </h2>
                    <div
                      id={`collapse${index}`}
                      className={`accordion-collapse collapse ${
                        index === 0 ? "show" : ""
                      }`}
                      aria-labelledby={`heading${index}`}
                      data-bs-parent="#accordionQuestions"
                    >
                      <div className="accordion-body">
                        <div className="row mb-5">
                          <div className="col-md-6">
                            <div className="text-gray-700 fw-bold fs-6 mb-2">
                              Question Type:
                            </div>
                            <div className="text-gray-900 fs-6">
                              {question.type === "single"
                                ? "Single Choice"
                                : question.type === "multiple"
                                ? "Multiple Choice"
                                : question.type}
                            </div>
                          </div>
                          <div className="col-md-6">
                            <div className="text-gray-700 fw-bold fs-6 mb-2">
                              Correct Answer:
                            </div>
                            <div className="text-gray-900 fs-6">
                              Option {question.correctAnswer}
                            </div>
                          </div>
                        </div>

                        <div className="mb-5">
                          <div className="text-gray-700 fw-bold fs-6 mb-2">
                            Options:
                          </div>
                          <div className="table-responsive">
                            <table className="table table-row-dashed table-row-gray-300 align-middle gs-0 gy-4">
                              <thead>
                                <tr className="fw-bold text-muted">
                                  <th>#</th>
                                  <th>Type</th>
                                  <th>Label</th>
                                </tr>
                              </thead>
                              <tbody>
                                {question.options.map((option, optIndex) => (
                                  <tr key={optIndex}>
                                    <td>{optIndex + 1}</td>
                                    <td>{option.type}</td>
                                    <td>{option.label}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">
                <KTIcon iconName="abstract-26" className="fs-3x text-muted" />
                <h3 className="mt-5 text-gray-800 fw-bold">
                  No Questions Added
                </h3>
                <div className="text-muted mt-3 fs-6">
                  This study doesn't have any questions yet. Click the "Add
                  Question" button to add one.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "statistics" && (
        <div className="card mb-5 mb-xl-10">
          <div className="card-header border-0">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">Study Statistics</h3>
            </div>
          </div>

          <div className="card-body p-9">
            <div className="row g-5 g-xxl-8">
              <div className="col-xl-6">
                <div className="card card-xxl-stretch mb-5 mb-xl-8">
                  <div className="card-header border-0 pt-5">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label fw-bolder fs-3 mb-1">
                        Participant Demographics
                      </span>
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div
                        style={{ height: "250px", width: "100%" }}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <div className="text-center">
                          <KTIcon
                            iconName="chart-pie-simple"
                            className="fs-5x text-gray-300"
                          />
                          <h3 className="mt-5 text-gray-800 fw-bold">
                            No Data Available
                          </h3>
                          <div className="text-muted mt-2">
                            Demographic data will appear here once participants
                            join the study.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-xl-6">
                <div className="card card-xxl-stretch mb-5 mb-xl-8">
                  <div className="card-header border-0 pt-5">
                    <h3 className="card-title align-items-start flex-column">
                      <span className="card-label fw-bolder fs-3 mb-1">
                        Response Statistics
                      </span>
                    </h3>
                  </div>
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-center flex-column">
                      <div
                        style={{ height: "250px", width: "100%" }}
                        className="d-flex align-items-center justify-content-center"
                      >
                        <div className="text-center">
                          <KTIcon
                            iconName="chart-simple"
                            className="fs-5x text-gray-300"
                          />
                          <h3 className="mt-5 text-gray-800 fw-bold">
                            No Data Available
                          </h3>
                          <div className="text-muted mt-2">
                            Response statistics will appear here once
                            participants submit responses.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "settings" && (
        <div className="card mb-5 mb-xl-10">
          <div className="card-header border-0">
            <div className="card-title m-0">
              <h3 className="fw-bolder m-0">Study Settings</h3>
            </div>
          </div>

          <div className="card-body p-9">
            <div className="notice d-flex bg-light-warning rounded border-warning border-dashed p-6">
              <KTIcon
                iconName="information-5"
                className="fs-2tx text-warning me-4"
              />
              <div className="d-flex flex-stack flex-grow-1">
                <div>
                  <h4 className="fw-bold text-gray-800">Study Settings</h4>
                  <div className="fs-6 text-gray-600">
                    Settings for this study can be modified by using the Edit
                    button above.
                    <br />
                    Once published, some settings may no longer be editable.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudyDetailPage;
