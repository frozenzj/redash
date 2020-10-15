import { toUpper } from "lodash";
import React from "react";
import routeWithUserSession from "@/components/ApplicationArea/routeWithUserSession";
import Link from "@/components/Link";
import PageHeader from "@/components/PageHeader";
import Paginator from "@/components/Paginator";
import EmptyState, { EmptyStateHelpMessage } from "@/components/empty-state/EmptyState";
import { wrap as itemsList, ControllerType } from "@/components/items-list/ItemsList";
import { ResourceItemsSource } from "@/components/items-list/classes/ItemsSource";
import { StateStorage } from "@/components/items-list/classes/StateStorage";
import DynamicComponent from "@/components/DynamicComponent";

import ItemsTable, { Columns } from "@/components/items-list/components/ItemsTable";

import Alert from "@/services/alert";
import { currentUser } from "@/services/auth";
import routes from "@/services/routes";

export const STATE_CLASS = {
  unknown: "label-warning",
  ok: "label-success",
  triggered: "label-danger",
};

class AlertsList extends React.Component {
  static propTypes = {
    controller: ControllerType.isRequired,
  };

  listColumns = [
    Columns.custom.sortable(
      (text, alert) => <i className={`fa fa-bell-${alert.options.muted ? "slash" : "o"} p-r-0`} />,
      {
        title: <i className="fa fa-bell p-r-0" />,
        field: "muted",
        width: "1%",
      }
    ),
    Columns.custom.sortable(
      (text, alert) => (
        <div>
          <Link className="table-main-title" href={"alerts/" + alert.id}>
            {alert.name}
          </Link>
        </div>
      ),
      {
        title: "名称",
        field: "name",
      }
    ),
    Columns.custom((text, item) => item.user.name, { title: "创建人", width: "1%" }),
    Columns.custom.sortable(
      (text, alert) => (
        <div>
          <span className={`label ${STATE_CLASS[alert.state]}`}>{toUpper(alert.state)}</span>
        </div>
      ),
      {
        title: "状态",
        field: "state",
        width: "1%",
        className: "text-nowrap",
      }
    ),
    Columns.timeAgo.sortable({ title: "最后更新时间", field: "updated_at", width: "1%" }),
    Columns.dateTime.sortable({ title: "创建时间", field: "created_at", width: "1%" }),
  ];

  render() {
    const { controller } = this.props;

    return (
      <div className="page-alerts-list">
        <div className="container">
          <PageHeader
            title={controller.params.pageTitle}
            actions={
              currentUser.hasPermission("list_alerts") ? (
                <Link.Button block type="primary" href="alerts/new">
                  <i className="fa fa-plus m-r-5" />
                  新建提醒
                </Link.Button>
              ) : null
            }
          />
          <div>
            {controller.isLoaded && controller.isEmpty ? (
              <DynamicComponent name="AlertsList.EmptyState">
                <EmptyState
                  icon="fa fa-bell-o"
                  illustration="alert"
                  description="接收事件通知"
                  helpMessage={<EmptyStateHelpMessage helpTriggerType="ALERTS" />}
                  showAlertStep
                />
              </DynamicComponent>
            ) : (
              <div className="table-responsive bg-white tiled">
                <ItemsTable
                  loading={!controller.isLoaded}
                  items={controller.pageItems}
                  columns={this.listColumns}
                  orderByField={controller.orderByField}
                  orderByReverse={controller.orderByReverse}
                  toggleSorting={controller.toggleSorting}
                />
                <Paginator
                  showPageSizeSelect
                  totalCount={controller.totalItemsCount}
                  pageSize={controller.itemsPerPage}
                  onPageSizeChange={itemsPerPage => controller.updatePagination({ itemsPerPage })}
                  page={controller.page}
                  onChange={page => controller.updatePagination({ page })}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const AlertsListPage = itemsList(
  AlertsList,
  () =>
    new ResourceItemsSource({
      isPlainList: true,
      getRequest() {
        return {};
      },
      getResource() {
        return Alert.query.bind(Alert);
      },
    }),
  () => new StateStorage({ orderByField: "created_at", orderByReverse: true, itemsPerPage: 20 })
);

routes.register(
  "Alerts.List",
  routeWithUserSession({
    path: "/alerts",
    title: "提醒",
    render: pageProps => <AlertsListPage {...pageProps} currentPage="alerts" />,
  })
);
