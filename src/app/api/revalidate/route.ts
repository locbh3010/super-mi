import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

export async function POST(request: NextRequest) {
	try {
		// 1. Lấy dữ liệu từ Query Parameters (hoặc có thể lấy từ Body nếu muốn)
		const { searchParams } = new URL(request.url);
		const tag = searchParams.get("tag");
		const secret = searchParams.get("secret");

		// 2. Bảo mật: Kiểm tra Secret Token để tránh người ngoài tự ý phá cache
		const SYSTEM_SECRET = process.env.REVALIDATE_SECRET;

		if (!SYSTEM_SECRET) {
			return NextResponse.json(
				{ message: "Lỗi cấu hình hệ thống phía Server." },
				{ status: 500 }
			);
		}

		if (secret !== SYSTEM_SECRET) {
			return NextResponse.json(
				{ message: "Mã bảo mật (Secret Token) không hợp lệ!" },
				{ status: 401 }
			);
		}

		// 3. Kiểm tra tham số tag truyền vào
		if (!tag) {
			return NextResponse.json(
				{ message: "Thiếu tham số 'tag' cần xóa cache." },
				{ status: 400 }
			);
		}

		// 4. Thực hiện xóa toàn bộ cache được gắn tag này trên Server Next.js
		// Ví dụ: tag = 'products' ứng với phần tử đầu tiên của queryKey trong helper
		revalidateTag(tag, "default");

		console.log(
			`✅ Đã xóa thành công cache của tag: [${tag}] vào lúc ${new Date().toISOString()}`
		);

		return NextResponse.json({
			revalidated: true,
			tag: tag,
			message: `Cache của tag [${tag}] đã được làm mới thành công.`,
			now: Date.now(),
		});
	} catch (error) {
		console.error("❌ Revalidate Error:", error);
		return NextResponse.json(
			{
				message: "Có lỗi xảy ra trong quá trình revalidate cache.",
				error: String(error),
			},
			{ status: 500 }
		);
	}
}
