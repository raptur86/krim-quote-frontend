
import {
  type HTMLAttributes,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
  type TdHTMLAttributes,
  type ReactNode,
} from "react";

import { Inbox, LoaderCircle } from "lucide-react";

import "./Table.css";

/* -----------------------------------------
   Table Container
----------------------------------------- */

export interface TableProps
  extends TableHTMLAttributes<HTMLTableElement> {
  children: ReactNode;
  minWidth?: number | string;
}

export function Table({
  children,
  minWidth,
  className = "",
  style,
  ...props
}: TableProps) {
  return (
    <div className="krim-table-scroll" role="region"
      aria-label={props["aria-label"] || "데이터 테이블"}
      tabIndex={0}
    >
      <table
        {...props}
        className={[
          "krim-table",
          className,
        ].filter(Boolean).join(" ")}
        style={{
          ...style,
          minWidth,
        }}
      >
        {children}
      </table>
    </div>
  );
}

/* -----------------------------------------
   Table Header
----------------------------------------- */

export interface TableHeadProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableHead({
  children,
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <thead
      {...props}
      className={[
        "krim-table__head",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </thead>
  );
}

/* -----------------------------------------
   Table Body
----------------------------------------- */

export interface TableBodyProps
  extends HTMLAttributes<HTMLTableSectionElement> {
  children: ReactNode;
}

export function TableBody({
  children,
  className = "",
  ...props
}: TableBodyProps) {
  return (
    <tbody
      {...props}
      className={[
        "krim-table__body",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </tbody>
  );
}

/* -----------------------------------------
   Table Row
----------------------------------------- */

export interface TableRowProps
  extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  clickable?: boolean;
}

export function TableRow({
  children,
  clickable = false,
  className = "",
  ...props
}: TableRowProps) {
  return (
    <tr
      {...props}
      className={[
        "krim-table__row",
        clickable ? "krim-table__row--clickable" : "",
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </tr>
  );
}

/* -----------------------------------------
   Table Header Cell
----------------------------------------- */

export interface TableHeaderCellProps
  extends ThHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
}

export function TableHeaderCell({
  children,
  align = "left",
  className = "",
  ...props
}: TableHeaderCellProps) {
  return (
    <th
      {...props}
      scope={props.scope ?? "col"}
      className={[
        "krim-table__th",
        `krim-table__cell--${align}`,
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </th>
  );
}

/* -----------------------------------------
   Table Data Cell
----------------------------------------- */

export interface TableCellProps
  extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
  align?: "left" | "center" | "right";
}

export function TableCell({
  children,
  align = "left",
  className = "",
  ...props
}: TableCellProps) {
  return (
    <td
      {...props}
      className={[
        "krim-table__td",
        `krim-table__cell--${align}`,
        className,
      ].filter(Boolean).join(" ")}
    >
      {children}
    </td>
  );
}

/* -----------------------------------------
   Empty State
----------------------------------------- */

export interface TableEmptyProps {
  colSpan: number;
  message?: string;
  description?: string;
}

export function TableEmpty({
  colSpan,
  message = "조회된 데이터가 없습니다.",
  description,
}: TableEmptyProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="krim-table__empty"
      >
        <div className="krim-table__state">
          <Inbox size={28} strokeWidth={1.5} />
          <strong>{message}</strong>
          {description && <p>{description}</p>}
        </div>
      </td>
    </tr>
  );
}

/* -----------------------------------------
   Loading State
----------------------------------------- */

export interface TableLoadingProps {
  colSpan: number;
  message?: string;
}

export function TableLoading({
  colSpan,
  message = "데이터를 불러오는 중입니다.",
}: TableLoadingProps) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="krim-table__loading"
      >
        <div
          className="krim-table__state"
          role="status"
        >
          <LoaderCircle
            className="krim-table__spinner"
            size={25}
          />
          <span>{message}</span>
        </div>
      </td>
    </tr>
  );
}
