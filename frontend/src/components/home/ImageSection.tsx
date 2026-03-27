export default function ImageSection() {
  const bgImage = './banner/image5.png'
    // "https://images.pexels.com/photos/27180805/pexels-photo-27180805.jpeg";

  return (
    <section
      className="relative w-full min-h-[85vh] flex items-center overflow-hidden"
      aria-label="Premium product showcase section"
    >
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center scale-105"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />

      {/* Premium Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-l from-black/60 via-black/30 to-transparent" />

      {/* Content */}
      {/* <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full">
        <div className="max-w-2xl ml-auto text-right text-white">
          
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl leading-tight tracking-wide">
            Mix. Match.
            <br />
            Make It Yours.
          </h1>

          <div className="mt-6 inline-block bg-[#7b5a3a] px-6 py-3 rounded-sm shadow-md">
            <p className="uppercase tracking-widest text-xs md:text-sm font-medium">
              Choose your plates, bowls, colours & patterns
            </p>
          </div>

          <p className="mt-6 text-base md:text-lg text-white/90 leading-relaxed">
            Build a set that’s perfect for everyday meals or special occasions.
          </p>

          <button
            className="mt-8 inline-flex items-center justify-center rounded-full border border-white px-8 py-3 text-sm font-semibold uppercase tracking-wider
            transition-all duration-300 hover:bg-white hover:text-[#7b5a3a] hover:shadow-lg"
          >
            Start Customising
          </button>

        </div>
      </div> */}
    </section>
  );
}
