import React from 'react';
import { Link } from 'react-router-dom';

const AdminNavbar = ({ token, logOut }) => {
  return (

    <div className="admin-navbar">
      <img id='jac-nav-image' src='https://lh3.googleusercontent.com/pw/AP1GczNXqu7-PEacO5GHHS4GR2RF1P9bVuoci-IZfXrwNL-auY1SM2RbUlQjvMGURXFlnz8I0GAqtpQ0Ufc561fo32cNiMHt_36euAVtegdxyP0JDFZf67MOQk5eg5OLa5sMJtd7wXnALMziyF38kFj9HGo36yHBECY8Xf2uusqNGY2raYZohGF2M6qvSZpe05wc21OS6FxZOsZsAxqfrqA_cJCRc-IVbjSfoAmpTaZIxxMTQ1GRmxbkkHDlnCmeut8tKKB0LNWFVxEnrwXC8V6qI1zsONbaHyh4ISyTFmfW3uGjU50rZUQ0inZzUb1VZA3-WSjcJSc-9kYhvxfBwsztS5pSpGKZc2CNtWqZu7z6I-ZFyA5ro5pHFhSl1SBrYjBO-UWrgad7dw_2n5uAomY70hMarcp41fxKUQtvoiVFk38SagCplnl6SN4dcGKwXarEbwgf0KP9_JhZnHpouRH2U_FPp6HIRztLeIbJLJHV7fM_UrMReomAbkTWT97E6zvUYHzG7pHsGyqD1gjNA8xm2tSbvruFbzx0o8WpJgIdXdlb6FqYyzLe9v-6JX5oedcZVa6MbUmhDpyswZLSn-vKSTJfAaQQLFuBPgUdq7fz_syJSFs6BUD0lONIPJG6U1eaw4yzQG8P2E0yYfCtJIzZo_oum7KpQxmuqOffAiMPJ1pnpFHry17pHlLHDhsu6drm-kKJgmFGMmeQfWGDcopTOSiqtDBKiUgalX8sD0J1dXlb_NcjV8nh_qSctyaj9kssp5BivDaMQ50BBEVj8I4M0M9MJp9rkx75J_TAzwg8PUTWYKy2ViGu257rpz8eop-WnE5fTpN4wTcxJylxV5Et5A7wzr3kPSbem3r3qn112DyHemUr1Glfsmlmj0KZRljp1jzfyuG63cpflvDsTg=w200-h200-s-no-gm?authuser=0'></img>
      <Link className="nav-link" to="/AdminHome">
        Home
      </Link>
      <Link className="nav-link" to="/AddProduct">
        Add Product
      </Link>
      <Link className="nav-link" to="/AdminViewCustomers">
        View All Customer
      </Link>
      {token ? (
        <button className="logout-btn" onClick={logOut}>
          Log Out
        </button>
      ) : (
        <Link className="login-link" to="/Login">
          Login
        </Link>
      )}

    </div>
  );
};

export default AdminNavbar;
