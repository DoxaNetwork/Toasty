import styled from 'styled-components';

export const Button = styled.button`
    border: 1px solid var(--main-color);
    background-color: var(--main-color);
    width: 127px;
    height: 50px;
    padding: 0px;
    color: var(--white);
    transition: all 200ms ease-in-out;
    cursor: pointer;
    font-size: 1em;

    &.unsaved {
        border: 1px solid var(--secondary-color);
        background-color: var(--secondary-color);
    }

    &:hover {
        background-color: var(--main-color);
        border: 1px solid var(--main-color);
    }
`