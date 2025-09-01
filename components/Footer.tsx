import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 text-center text-sm text-slate-400">
      <p>
        © {new Date().getFullYear()} Ladder Snake •
        <a href="./privacy.html" className="mx-2 text-sky-400 no-underline border-b border-dotted border-sky-400/35 hover:text-sky-300 hover:border-sky-300 transition-colors">
          Privacy Policy
        </a> •
        <a href="./terms.html" className="mx-2 text-sky-400 no-underline border-b border-dotted border-sky-400/35 hover:text-sky-300 hover:border-sky-300 transition-colors">
          Terms of Service
        </a> •
        <a href="mailto:contact@ladder-snake.com" className="mx-2 text-sky-400 no-underline border-b border-dotted border-sky-400/35 hover:text-sky-300 hover:border-sky-300 transition-colors">
          Contact
        </a>
      </p>
    </footer>
  );
};

export default Footer;