import React, { useState } from 'react';
import AboutCss from './About.module.css';

function About() {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={AboutCss.aboutBtn}>
        ?
      </button>
      <section className={`${isOpen ? '' : AboutCss.opacity0}`}>
        About
        <main>Description</main>
        <footer>Contacts</footer>
      </section>
    </>
  );
}

export default About;
