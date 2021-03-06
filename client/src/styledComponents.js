import styled from 'styled-components';

export const Button = styled.button`
    border: 1px solid var(--primary);
    background-color: var(--primary);
    width: 127px;
    height: 50px;
    padding: 0px;
    color: var(--white);
    transition: all 200ms ease-in-out;
    cursor: pointer;
    font-size: 1.2em;
    border-radius: 5px;
    font-weight:800;

    &:hover {
        background-color:var(--bright);
        border-color:var(--bright);
        transition: none;
    }
`

export const Back = styled.div`
    margin-bottom:20px;
    font-size:1.2em;
    font-weight:800;
    a {
        color: var(--primary);
        text-decoration: none;
        display: flex;
        align-items: center;
        cursor: pointer;
    }
    a:hover {
        color: var(--bright);
    }
`