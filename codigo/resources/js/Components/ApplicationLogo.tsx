import { SVGAttributes } from 'react';
import logo from '../../img/logo.png';

export default function ApplicationLogo(props: SVGAttributes<SVGElement>) {
    return (
        <img src={logo} alt="Logo" className="h-24 w-auto" />
    );
}
