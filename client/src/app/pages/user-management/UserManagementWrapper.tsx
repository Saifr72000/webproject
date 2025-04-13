import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { PageLink, PageTitle } from "../../../_metronic/layout/core";
import { UsersListWrapper } from "../../modules/apps/user-management/users-list/UsersList";

const usersBreadcrumbs: Array<PageLink> = [
  {
    title: "User Management",
    path: "/user-management/users",
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

const UserManagementWrapper = () => {
  return (
    <>
      <PageTitle breadcrumbs={usersBreadcrumbs}>Users list</PageTitle>
      <UsersListWrapper />
    </>
  );
};

export default UserManagementWrapper;
