import React from 'react';

import { AccessFileData, fileManagercolumns } from './FileManagerData';

import DataTable from '../../../../../../../../../Common/DataTable/DataTable';
import DataTableHeader from '../../../../../../../../../Common/DataTableHeader/DataTableHeader';
import DataTableFooter from '../../../../../../../../../Common/DataTableFooter/DataTableFooter';

const FileManagerTable = () => {
  const dataT = AccessFileData.map((data) => {
    return {
      folder: ( <i className={`${data.file_folder} ${data.theme_color}`}></i> ),
      name: ( <span className="folder-name">{data.name}</span> ) ,
      shareWith: (
        <div className="avatar-list ps-3">
          {data.share_with.length === 0 ? (
              <span>-</span>
            ) : (
              data.share_with.map((img, imgIndex) => (
              <img key={imgIndex} className="avatar sm rounded-circle me-1" src={img} data-bs-toggle="tooltip" title="Avatar"/>
            ))
            )}
        </div>
      ),
      owner: ( <span>{data.owner}</span> ),
      lastUpdate: ( <span>{data.last_update}</span> ),
      size: ( <span className="size">{data.size}</span> ),
    };
  });

  return (
    <>
      <DataTableHeader />
      <DataTable columns={fileManagercolumns} data={dataT} />
      <DataTableFooter dataT={dataT}/>
    </>
  )
};

export default FileManagerTable;
