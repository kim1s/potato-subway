export const metadata = {
  title: "Terms of Use | Potato on the Subway",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-[0.5625rem] font-semibold uppercase tracking-widest text-stone-400 mb-3">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-stone-700">
        {children}
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <div className="min-h-dvh px-5 py-10 bg-[#f0f0ee]">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-10">
          <span className="text-sm font-semibold uppercase tracking-wider text-stone-900">
            Potato on the Subway
          </span>
          <p className="text-xs text-stone-400 mt-2">이용약관 · 최종 수정일 2026년 7월 22일</p>
        </header>

        <div className="bg-white border border-stone-200 p-6">
          <p className="text-sm leading-relaxed text-stone-700 mb-8">
            본 약관은 &ldquo;Potato on the Subway&rdquo;(이하 &ldquo;서비스&rdquo;)의 웹사이트 및 모바일
            앱 이용과 관련하여 운영자와 이용자 간의 권리, 의무 및 책임 사항을 정합니다. 서비스를 이용함으로써
            본 약관에 동의한 것으로 간주됩니다.
          </p>

          <Section title="1. 서비스 소개">
            <p>
              서비스는 매주 평일 아침마다 영어 단어 하나와 한국어 뜻, 예문을 보여주고, 누구나 비로그인 상태로
              자유롭게 짧은 댓글(노트)을 남길 수 있는 무료 영어 학습 서비스입니다. 회원가입이나 결제 기능은
              제공하지 않습니다.
            </p>
          </Section>

          <Section title="2. 이용 조건">
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>서비스는 별도의 가입 절차 없이 누구나 무료로 이용할 수 있습니다.</li>
              <li>
                서비스는 만 14세 이상 이용을 권장하며, 만 14세 미만 이용자는 보호자의 지도 아래 이용해 주세요.
              </li>
              <li>운영자는 서비스 내용을 사전 고지 없이 변경하거나 중단할 수 있습니다.</li>
            </ul>
          </Section>

          <Section title="3. 댓글(노트) 작성과 책임">
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>이용자가 작성한 댓글의 내용과 그로 인해 발생하는 책임은 작성자 본인에게 있습니다.</li>
              <li>
                운영자는 게시되는 모든 댓글을 사전에 검수하지 않으며, 게시 이후 신고 접수나 운영자 판단에 따라
                삭제·비공개 처리할 수 있습니다.
              </li>
              <li>
                이용자는 댓글 옆 신고 아이콘을 통해 부적절한 댓글을 신고할 수 있으며, 신고된 댓글은 즉시 모든
                이용자에게 비공개로 전환됩니다.
              </li>
              <li>
                모바일 앱에서는 서비스가 발급한 익명 식별자를 기준으로, 신고되어 비공개 처리된 댓글이 누적
                3건 이상인 이용자는 사전 통지 없이 댓글 작성 권한이 영구적으로 제한됩니다.
              </li>
            </ul>
          </Section>

          <Section title="4. 금지 행위 및 무관용 원칙">
            <p>
              서비스는 부적절한 콘텐츠와 악성 이용자에 대해 무관용(zero-tolerance) 원칙을 적용합니다. 이용자는
              댓글 작성 시 다음 행위를 해서는 안 됩니다.
            </p>
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>스팸, 광고, 도배성 게시물 작성</li>
              <li>욕설, 비방, 혐오 표현 등 타인에게 불쾌감을 주는 게시</li>
              <li>음란물 또는 선정적인 내용 게시</li>
              <li>타인의 권리(저작권, 초상권, 개인정보 등)를 침해하는 게시</li>
              <li>관련 법령을 위반하거나 서비스 운영을 방해하는 행위(자동화된 도배, 시스템 공격 등)</li>
            </ul>
            <p>
              위 행위가 확인될 경우 사전 통지 없이 해당 댓글을 삭제하며, 반복 위반 시 댓글 작성 권한을 영구적으로
              제한합니다. 부적절한 콘텐츠나 악성 이용자를 발견하신 경우 댓글 옆 신고 아이콘을 이용하시거나
              아래 9항의 이메일로 알려주시면 신고 접수 후 24시간 이내에 조치합니다.
            </p>
          </Section>

          <Section title="5. 지적재산권">
            <p>
              서비스에서 제공하는 단어, 뜻풀이, 예문, 디자인, 로고 등 콘텐츠에 대한 저작권은 운영자에게
              있습니다. 이용자가 작성한 댓글의 저작권은 작성자 본인에게 있으나, 작성자는 운영자가 해당 댓글을
              서비스 내에서 게시·보관·삭제할 수 있도록 허락한 것으로 간주됩니다.
            </p>
          </Section>

          <Section title="6. 면책 조항">
            <p>
              서비스는 무료로 제공되며 &ldquo;있는 그대로(as-is)&rdquo; 제공됩니다. 운영자는 서비스의 단어
              뜻풀이나 예문의 완전한 정확성을 보증하지 않으며, 서비스 이용 중 발생할 수 있는 일시적인 오류나
              중단, 이용자가 작성한 댓글의 내용으로 인해 발생하는 손해에 대해 법령이 허용하는 범위 내에서
              책임을 지지 않습니다.
            </p>
          </Section>

          <Section title="7. 약관의 변경">
            <p>
              본 약관은 필요에 따라 개정될 수 있으며, 변경 시 본 페이지를 통해 고지합니다. 변경된 약관은
              공시한 시점부터 효력이 발생합니다.
            </p>
          </Section>

          <Section title="8. 분쟁 해결 및 관할">
            <p>
              본 약관과 관련하여 발생하는 분쟁은 대한민국 법령을 적용하며, 운영자 주소지를 관할하는 법원을
              제1심 관할 법원으로 합니다.
            </p>
          </Section>

          <Section title="9. 문의">
            <p>
              서비스 이용 또는 본 약관과 관련한 문의는 아래 이메일로 연락해 주세요.
              <br />
              <a href="mailto:studio.doosle@gmail.com" className="font-medium text-stone-900 underline">
                studio.doosle@gmail.com
              </a>
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
