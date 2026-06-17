export default function DemoVideo() {
  return (
    <section className="py-[60px] md:py-[80px] bg-white">
      <div className="max-w-[900px] mx-auto px-[24px]">
        <div className="text-center mb-[32px]">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-secondary-900 mb-[12px]">
            Velo en acción
          </h2>
          <p className="text-[15px] md:text-[17px] text-secondary-600 max-w-[500px] mx-auto">
            Mirá cómo los niños aprenden palabras jugando con cámara, OCR y voz.
          </p>
        </div>

        {/* Video wrapper — 16:9 aspect ratio */}
        <div className="relative w-full rounded-[16px] overflow-hidden shadow-lg bg-secondary-100">
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/jntW1G83-VY"
              title="AlphaKids — Video Demo"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
