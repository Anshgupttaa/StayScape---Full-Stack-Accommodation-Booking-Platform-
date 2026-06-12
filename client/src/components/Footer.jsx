import { FaGlobe, FaFacebookSquare, FaTwitterSquare, FaInstagramSquare, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">
              Stay<span className="text-rose-500">Scape</span>
            </h2>
            <p className="text-sm">
              Discover and book exceptional stays around the world.
            </p>
            <div className="flex items-center gap-4 pt-2">
               <a href="#" className="hover:text-white transition"><FaInstagramSquare size={20} /></a>
               <a href="#" className="hover:text-white transition"><FaTwitterSquare size={20} /></a>
               <a href="#" className="hover:text-white transition"><FaLinkedin size={20} /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-bold text-white">Categories</h4>
            <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition">Villas & Mansions</a></li>
               <li><a href="#" className="hover:text-white transition">Coastal Escapes</a></li>
               <li><a href="#" className="hover:text-white transition">Urban Sanctuaries</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-white">Company</h4>
            <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition">About Us</a></li>
               <li><a href="#" className="hover:text-white transition">Careers</a></li>
               <li><a href="#" className="hover:text-white transition">Contact</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-4">
            <h4 className="font-bold text-white">Support</h4>
            <ul className="space-y-2 text-sm">
               <li><a href="#" className="hover:text-white transition">Help Center</a></li>
               <li><a href="#" className="hover:text-white transition">Safety Information</a></li>
               <li><a href="#" className="hover:text-white transition">Cancellation Options</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="flex flex-wrap items-center gap-4">
             <span>© {new Date().getFullYear()} Stayscape.</span>
             <a href="#" className="hover:text-white transition">Privacy</a>
             <a href="#" className="hover:text-white transition">Terms</a>
          </div>

          <div className="flex items-center gap-4">
             <button className="flex items-center gap-2 hover:text-white transition">
               <FaGlobe /> English
             </button>
             <button className="hover:text-white transition">
               ₹ INR
             </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
