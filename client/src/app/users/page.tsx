"use client";
import { useGetUsersQuery } from "@/state/api";
import React from "react";
import { useAppSelector } from "../redux";
import Header from "@/components/Header";
import {
  DataGrid,
  GridColDef,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import Image from "next/image";
import { dataGridClassNames, dataGridSxStyles } from "@/lib/utils";

const CustomToolbar = () => (
  <GridToolbarContainer className="toolbar flex gap-2">
    <GridToolbarFilterButton />
    <GridToolbarExport />
  </GridToolbarContainer>
);

const columns: GridColDef[] = [
  { field: "userId", headerName: "ID", width: 100 },
  { field: "username", headerName: "Username", width: 200 },
  {
    field: "profilePictureUrl",
    headerName: "Profile Picture",
    width: 120,
    renderCell: (params) => (
      <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8">
          <Image
            src={`https://pm-s3-amages.s3.eu-north-1.amazonaws.com/${params.value}`}
            alt={params.row.username}
            width={32}
            height={32}
            className="h-full w-full rounded-full object-cover"
          />
        </div>
      </div>
    ),
  },
  { field: "email", headerName: "Email", width: 250 },
  { field: "teamId", headerName: "Team ID", width: 100 },
];

const Users = () => {
  const { data: users, isLoading, isError } = useGetUsersQuery();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

  if (isError || !users) return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-800">Error fetching users. Please try again later.</p>
      </div>
    </div>
  );

  return (
    <div className="flex w-full flex-col p-8">
      <Header name="Users" />
      <div className="bg-white dark:bg-dark-secondary rounded-lg shadow-sm">
        <div style={{ height: 650, width: "100%" }}>
          <DataGrid
            rows={users || []}
            columns={columns}
            getRowId={(row) => row.userId}
            pagination
            slots={{
              toolbar: CustomToolbar,
            }}
            className={dataGridClassNames}
            sx={dataGridSxStyles(isDarkMode)}
          />
        </div>
      </div>
    </div>
  );
};

export default Users;