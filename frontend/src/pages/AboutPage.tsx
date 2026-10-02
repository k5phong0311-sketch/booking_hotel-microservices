import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="bg-gray-50 min-h-screen pt-24 pb-20 font-serif">
      {/* Hero Section */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden mb-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=2000&auto=format&fit=crop')" }}></div>
        <div className="absolute inset-0 bg-brand-dark/50 mix-blend-multiply"></div>
        <div className="relative z-10 text-center px-6">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-md">Về Chúng Tôi</h1>
          <p className="text-xl text-brand-light font-medium max-w-2xl mx-auto drop-shadow-sm">Hành trình kiến tạo những trải nghiệm lưu trú đẳng cấp.</p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6">
        {/* Story Section */}
        <section className="mb-24 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2">
            <img src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000&auto=format&fit=crop" alt="Hotel Story" className="rounded-lg shadow-xl" />
          </div>
          <div className="md:w-1/2">
            <h2 className="text-sm font-bold text-brand-DEFAULT uppercase tracking-widest mb-2">Câu chuyện hình thành</h2>
            <h3 className="text-4xl font-bold text-brand-dark mb-6 leading-snug">Từ một tầm nhìn vượt thời gian...</h3>
            <p className="text-gray-600 text-lg leading-relaxed mb-6">BOOKINGHOTEL được thành lập với định hướng trở thành biểu tượng của sự sang trọng, tinh tế và hoàn mỹ. Chúng tôi hiểu rằng mỗi chuyến đi không chỉ là sự di chuyển mà còn là những kỷ niệm đáng giá nhất.</p>
            <p className="text-gray-600 text-lg leading-relaxed">Trải qua hơn một thập kỷ phát triển, từ một khách sạn khiêm tốn, chúng tôi đã không ngừng vươn mình để mang lại một hệ sinh thái nghỉ dưỡng đẳng cấp và mang đậm bản sắc Việt.</p>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="mb-24 bg-white p-12 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Giá trị cốt lõi</h2>
            <div className="w-16 h-1 bg-brand-DEFAULT mx-auto rounded"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-light text-brand-DEFAULT rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">⭐</div>
              <h4 className="text-xl font-bold text-brand-dark mb-3">Chất lượng quốc tế</h4>
              <p className="text-gray-600 leading-relaxed">Mọi chi tiết trong không gian và dịch vụ đều được thiết kế theo tiêu chuẩn nghỉ dưỡng khắt khe nhất thế giới.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-light text-brand-DEFAULT rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">🤝</div>
              <h4 className="text-xl font-bold text-brand-dark mb-3">Khách hàng là trung tâm</h4>
              <p className="text-gray-600 leading-relaxed">Sự hài lòng của bạn là thước đo duy nhất cho thành công của chúng tôi. Phục vụ tận tâm, đón tiếp nhiệt thành.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-brand-light text-brand-DEFAULT rounded-full flex items-center justify-center mx-auto mb-6 text-2xl shadow-sm">🌿</div>
              <h4 className="text-xl font-bold text-brand-dark mb-3">Phát triển bền vững</h4>
              <p className="text-gray-600 leading-relaxed">Tôn trọng môi trường và văn hóa địa phương, chúng tôi ưu tiên các giải pháp sinh thái xanh, tiết kiệm năng lượng.</p>
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-brand-dark mb-4">Hành trình phát triển</h2>
            <div className="w-16 h-1 bg-brand-DEFAULT mx-auto rounded"></div>
          </div>
          <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
            {/* Milestone 1 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-DEFAULT text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">1</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-brand-DEFAULT font-bold mb-1">2010</div>
                <h4 className="text-lg font-bold text-brand-dark mb-2">Những viên gạch đầu tiên</h4>
                <p className="text-gray-600 text-sm">Khởi nguồn với ý tưởng về một khách sạn Boutique tại trung tâm thành phố, mang lại cảm giác ấm cúng và hoàn hoảo.</p>
              </div>
            </div>
            {/* Milestone 2 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-DEFAULT text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">2</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-brand-DEFAULT font-bold mb-1">2015</div>
                <h4 className="text-lg font-bold text-brand-dark mb-2">Vươn mình mạnh mẽ</h4>
                <p className="text-gray-600 text-sm">Khai trương chuỗi nghỉ dưỡng 5 sao tại các vùng biển đẹp nhất Việt Nam, đánh dấu bước chuyển mình quốc tế hóa.</p>
              </div>
            </div>
            {/* Milestone 3 */}
            <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-brand-DEFAULT text-white font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">3</div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="text-brand-DEFAULT font-bold mb-1">2026</div>
                <h4 className="text-lg font-bold text-brand-dark mb-2">Tiên phong công nghệ số</h4>
                <p className="text-gray-600 text-sm">Ra mắt ứng dụng BOOKINGHOTEL cùng hệ thống đặt phòng vi mô (đặt theo giờ) và Chatbot AI thông minh.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
