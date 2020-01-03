import React, { useState, useMemo, useRef, createRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100vw;
  height: 100vh;
`;

export default function App() {
  const [data, setState] = useState('none');
  return <Container onClick={() => {}}>{data}</Container>;
}
