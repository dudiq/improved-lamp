import { styled } from '@linaria/react'

export const Separator = styled.div`
  width: 100%;
  height: 1px;
  background: var(--clr-5);
  background: linear-gradient(
    to right,
    transparent 0%,
    var(--clr-5) 10%,
    var(--clr-5) 90%,
    transparent 100%
  );
`
