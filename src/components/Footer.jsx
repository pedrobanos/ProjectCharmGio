


const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-4 ">
            <div className="container mx-auto text-center">
                <p className="text-sm">
                    Hecho con ❤️ por Pedro Baños.
                    &copy; {new Date().getFullYear()} Charm Gio. Todos los derechos reservados.
                </p>
            </div>
        </footer>
    );
}

export default Footer;