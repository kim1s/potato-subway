import { BackButton } from "@/components/BackButton";

export const metadata = {
  title: "Privacy Policy | Potato on the Subway",
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

export default function PrivacyPage() {
  return (
    <div className="min-h-dvh px-5 py-10 bg-[#f0f0ee]">
      <div className="mx-auto w-full max-w-lg">
        <header className="mb-10">
          <div className="flex items-center gap-1.5">
            <BackButton />
            <span className="text-sm font-semibold uppercase tracking-wider text-stone-900">
              Potato on the Subway
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-2">개인정보처리방침 · 최종 수정일 2026년 7월 22일</p>
        </header>

        <div className="bg-white border border-stone-200 p-6">
          <p className="text-sm leading-relaxed text-stone-700 mb-8">
            &ldquo;Potato on the Subway&rdquo;(이하 &ldquo;서비스&rdquo;)는 이용자의 개인정보를 소중히 여기며,
            아래와 같이 최소한의 정보만을 수집·이용합니다. 서비스는 별도의 회원가입 없이 누구나 이용할 수
            있으며, 이름·이메일 등 개인을 특정할 수 있는 정보를 수집하지 않습니다.
          </p>

          <Section title="1. 수집하는 정보">
            <p>서비스는 다음과 같은 정보를 수집합니다.</p>
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>
                <span className="font-medium text-stone-900">작성하신 댓글(노트) 내용</span> — 단어에 대해
                자유롭게 남기는 텍스트로, 작성자의 이름·연락처 등을 요구하지 않습니다.
              </li>
              <li>
                <span className="font-medium text-stone-900">IP 주소(해시 처리)</span> — 댓글 작성 시 IP
                주소를 수집하지만, 원본 IP는 저장하지 않고 솔트(salt) 값을 더해 단방향 해시(SHA-256)로 변환한
                값만 저장합니다. 이 값으로는 실제 IP나 신원을 역으로 알아낼 수 없으며, 동일 기기의 중복 신고를
                막거나 비정상적인 도배·악용을 방지하는 목적으로만 사용됩니다.
              </li>
              <li>
                <span className="font-medium text-stone-900">신고 정보</span> — 댓글을 신고할 때 선택한 사유
                (스팸/욕설/음란물/기타)와 위 해시 처리된 IP 값이 함께 저장됩니다.
              </li>
              <li>
                <span className="font-medium text-stone-900">익명 기기 식별자(모바일 앱)</span> — 모바일 앱은
                실명·연락처 등과 무관한 임의의 문자열 ID를 기기에 생성해 저장합니다. 이 ID는 회원 식별이나
                광고 목적이 아니라, 반복적으로 신고되는 이용자의 댓글 작성 권한을 제한하는 부정 이용 방지
                목적으로만 댓글 작성 시 함께 전송·저장됩니다.
              </li>
              <li>
                <span className="font-medium text-stone-900">서비스 이용 통계</span> — 화면 방문, 예문 넘기기,
                댓글 작성/신고와 같은 기능 사용 여부를 파악하기 위해 Google Analytics(웹), Firebase
                Analytics·Amplitude(모바일 앱)를 통해 비식별·집계 형태의 이용 통계를 수집합니다. 이 통계는
                개인을 식별하지 않으며, 기기/브라우저에 발급되는 임의의 식별자를 기준으로 집계됩니다.
              </li>
            </ul>
            <p>
              서비스는 회원가입 기능이 없으므로 이름, 이메일, 전화번호, 결제 정보 등은 일체 수집하지 않습니다.
            </p>
          </Section>

          <Section title="2. 정보 이용 목적">
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>댓글(노트) 기능 제공 및 화면 표시</li>
              <li>스팸·욕설·도배성 댓글 등 악용 방지 및 신고 처리</li>
              <li>반복 신고된 이용자(모바일 앱)에 대한 댓글 작성 권한 제한</li>
              <li>서비스 오류 확인 및 기능 개선</li>
              <li>익명화된 통계를 통한 서비스 이용 현황 파악</li>
            </ul>
          </Section>

          <Section title="3. 보관 기간">
            <p>
              작성된 댓글과 이에 연결된 해시 처리 IP 값은 해당 댓글이 삭제(신고로 인한 비공개 처리 또는 운영자
              삭제)되거나, 댓글이 달린 단어 콘텐츠가 삭제되기 전까지 보관됩니다. 신고된 댓글은 신고 즉시
              모든 이용자에게 보이지 않도록 비공개 처리되며, 이후 운영자가 검토하여 영구 삭제할 수 있습니다.
              모바일 앱의 익명 기기 식별자는 댓글 작성 권한 제한 처리를 위해 필요한 기간 동안 보관됩니다.
            </p>
          </Section>

          <Section title="4. 제3자 제공 및 처리위탁">
            <p>
              서비스는 이용자의 개인정보를 제3자에게 판매하거나 마케팅 목적으로 제공하지 않습니다. 다만 서비스
              운영을 위해 아래와 같은 외부 업체의 인프라를 이용하고 있으며, 각 업체는 자체 개인정보처리방침에
              따라 데이터를 처리합니다.
            </p>
            <ul className="list-disc list-outside ml-4 space-y-1">
              <li>Supabase — 댓글·콘텐츠 데이터베이스 호스팅</li>
              <li>Vercel — 웹사이트 호스팅</li>
              <li>Google Analytics / Firebase — 웹·앱 이용 통계 분석</li>
              <li>Amplitude — 앱 이용 통계 분석</li>
            </ul>
          </Section>

          <Section title="5. 쿠키">
            <p>
              웹 버전은 Google Analytics 이용을 위해 쿠키를 사용할 수 있습니다. 이는 방문 통계 집계 목적으로만
              사용되며, 브라우저 설정에서 쿠키 저장을 차단하거나 삭제할 수 있습니다. 서비스에 로그인 기능이
              없으므로 인증·세션 유지를 위한 쿠키는 사용하지 않습니다.
            </p>
          </Section>

          <Section title="6. 이용자의 권리">
            <p>
              서비스는 회원가입을 받지 않아 작성자 본인 확인이 불가능하므로, 본인이 작성한 댓글을 삭제하고
              싶을 경우 아래 연락처로 댓글 내용·작성 단어·작성 시점을 알려주시면 확인 후 삭제해 드립니다.
              부적절한 댓글을 발견한 경우 댓글 옆 신고(🚩) 아이콘을 눌러 누구나 즉시 비공개 처리를 요청할 수
              있습니다.
            </p>
          </Section>

          <Section title="7. 만 14세 미만 아동의 개인정보">
            <p>
              서비스는 만 14세 미만 아동을 대상으로 별도의 개인정보를 수집하지 않으며, 이를 알게 될 경우 즉시
              관련 정보를 삭제합니다.
            </p>
          </Section>

          <Section title="8. 정책 변경">
            <p>
              본 개인정보처리방침은 법령이나 서비스 변경에 따라 수정될 수 있으며, 변경 시 본 페이지를 통해
              고지합니다.
            </p>
          </Section>

          <Section title="9. 문의">
            <p>
              개인정보와 관련한 문의나 삭제 요청은 아래 이메일로 연락해 주세요.
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
