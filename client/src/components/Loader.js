import React from 'react';
import { Loader as MantineLoader } from '@mantine/core';

function Loader() {
  return (
    <div className="loader-parent">
      <MantineLoader size="lg" />
    </div>
  );
}

export default Loader;