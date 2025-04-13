import { useIntl } from "react-intl";
import { KTIcon } from "../../../helpers";
import { AsideMenuItemWithSub } from "./AsideMenuItemWithSub";
import { AsideMenuItem } from "./AsideMenuItem";

export function AsideMenuMain() {
  const intl = useIntl();

  return (
    <>
      <AsideMenuItem
        to="/dashboard"
        icon="black-right"
        title={intl.formatMessage({ id: "MENU.DASHBOARD" })}
        fontIcon="bi-app-indicator"
      />
      {/* This should send the user to studies page */}
      <AsideMenuItem
        to="/study"
        icon="black-right"
        title="Studies"
        fontIcon="bi-layers"
      />
      {/* This should sens the user to Files page */}
      <AsideMenuItem
        to="/files"
        icon="black-right"
        title="Files"
        fontIcon="bi-layers"
      />

      <AsideMenuItem
        to="/user-management"
        icon="black-right"
        title="User management"
        fontIcon="bi-layers"
      />
      {/*  <AsideMenuItem
        to="/builder"
        icon="black-right"
        title="Layout Builder"
        fontIcon="bi-layers"
      /> */}
      {/* <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1">
            Design inspiration
          </span>
        </div>
      </div> */}

      {/* <AsideMenuItemWithSub
        to="/crafted/pages"
        title="Pages"
        fontIcon="bi-archive"
        icon="black-right"
      >
        <AsideMenuItemWithSub
          to="/crafted/pages/profile"
          title="Profile"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/pages/profile/overview"
            title="Overview"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/projects"
            title="Projects"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/campaigns"
            title="Campaigns"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/documents"
            title="Documents"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/profile/connections"
            title="Connections"
            hasBullet={true}
          />
        </AsideMenuItemWithSub>

        <AsideMenuItemWithSub
          to="/crafted/pages/wizards"
          title="Wizards"
          hasBullet={true}
        >
          <AsideMenuItem
            to="/crafted/pages/wizards/horizontal"
            title="Horizontal"
            hasBullet={true}
          />
          <AsideMenuItem
            to="/crafted/pages/wizards/vertical"
            title="Vertical"
            hasBullet={true}
          />
        </AsideMenuItemWithSub>
      </AsideMenuItemWithSub>
      <AsideMenuItemWithSub
        to="/crafted/accounts"
        title="Accounts"
        icon="black-right"
        fontIcon="bi-person"
      >
        <AsideMenuItem
          to="/crafted/account/overview"
          title="Overview"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/account/settings"
          title="Settings"
          hasBullet={true}
        />
      </AsideMenuItemWithSub>
      <AsideMenuItemWithSub
        to="/error"
        title="Errors"
        fontIcon="bi-sticky"
        icon="black-right"
      >
        <AsideMenuItem to="/error/404" title="Error 404" hasBullet={true} />
        <AsideMenuItem to="/error/500" title="Error 500" hasBullet={true} />
      </AsideMenuItemWithSub>
      <AsideMenuItemWithSub
        to="/crafted/widgets"
        title="Widgets"
        icon="black-right"
        fontIcon="bi-layers"
      >
        <AsideMenuItem
          to="/crafted/widgets/lists"
          title="Lists"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/widgets/statistics"
          title="Statistics"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/widgets/charts"
          title="Charts"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/widgets/mixed"
          title="Mixed"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/widgets/tables"
          title="Tables"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/crafted/widgets/feeds"
          title="Feeds"
          hasBullet={true}
        />
      </AsideMenuItemWithSub> */}
      <div className="menu-item">
        <div className="menu-content pt-8 pb-2">
          <span className="menu-section text-muted text-uppercase fs-8 ls-1"></span>
        </div>
      </div>
      {/* <AsideMenuItemWithSub
        to="/apps/chat"
        title="Chat"
        fontIcon="bi-chat-left"
        icon="black-right"
      >
        <AsideMenuItem
          to="/apps/chat/private-chat"
          title="Private Chat"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/apps/chat/group-chat"
          title="Group Chart"
          hasBullet={true}
        />
        <AsideMenuItem
          to="/apps/chat/drawer-chat"
          title="Drawer Chart"
          hasBullet={true}
        />
      </AsideMenuItemWithSub> */}
      {/* <AsideMenuItem
        to="/apps/user-management/users"
        icon="black-right"
        title="User management"
        fontIcon="bi-layers"
      /> */}
      <div className="menu-item">
        <div className="menu-content">
          <div className="separator mx-1 my-4"></div>
        </div>
      </div>
    </>
  );
}
