export default function Home() {
  return (
    <main className="container">
      
      {/* Introduction */}
      <section className="hero-section">
        <h1 className="hero-title">Hello, I am Rafael Duarte!</h1>
        <h2 className="hero-subtitle">Machine Learning Researcher & Information Systems Student</h2>
      </section>

      {/* Section Divider */}
      <div className="section-divider"></div>

      {/* About Me */}
      <section className="about-section">
        
        <h3 className="about-title" style={{ marginBottom: '8px', marginLeft: '5px', fontWeight: 'bold' }}>
          About Me
        </h3>
        
        <div className="about-content">
          
          <img src="/image.png" alt="Rafael Duarte" className="about-image" />
          
          <div className="about-text-content">
            <p className="about-text">
              I am a <span style={{ fontWeight: 'bold' }}>Machine Learning Researcher and Information Systems student at University of São Paulo</span> with
              interest in the intersection of Data Science and Software Engineering. My journey in 
              the field of computer science has been driven by a desire to explore cutting-edge 
              technologies and contribute to advancements in artificial intelligence. I am dedicated 
              to continuous learning and actively seek opportunities to apply my skills in real-world 
              projects. In the moment, <span style={{ fontWeight: 'bold' }}>I am focusing on developing applications for Graph Neural Networks models.</span>
            </p>
            <div className="section-divider" style={{ marginTop: '20px', marginBottom: '20px' }}></div>
            <div>
                <p className="about-text">
                    Feel free to check my <span style={{ fontWeight: 'bold' }}>Resumé</span> and <span style={{ fontWeight: 'bold' }}>Curriculum Vitae</span> for more details about me and my work.
                </p>
                <div className="about-buttons">
                
                    <a href="https://github.com/rduarte12/portifolio-documents/blob/main/Resum%C3%A9___English_Version.pdf" target="_blank" rel="noopener noreferrer" className="btn">
                        Resumé
                    </a>
                    <a href="https://github.com/rduarte12/portifolio-documents/blob/main/Curriculum_Vitae.pdf" target="_blank" rel="noopener noreferrer" className="btn">
                        Curriculum Vitae
                    </a>
                </div>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}