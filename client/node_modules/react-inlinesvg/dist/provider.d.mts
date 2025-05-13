import { ReactNode } from 'react';

interface Props {
    children: ReactNode;
    name?: string;
}
declare function CacheProvider({ children, name }: Props): ReactNode;

export { CacheProvider as default };
